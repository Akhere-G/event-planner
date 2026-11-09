# Background AI tasks: GCP setup runbook

AI work (fill a day, optimise days, generate a trip, packing list) runs as a **Cloud Task** that
calls back into the same Cloud Run service at `POST /api/internal/ai-tasks/<id>/run`. Because the
callback is an ordinary request, Cloud Run keeps CPU allocated while the AI runs, so the service
can stay on "CPU only during requests".

The callback is authenticated with a Google-signed OIDC token. The app accepts it only when the
token's audience is `SERVICE_BASE_URL` and its email is `CLOUD_TASKS_SERVICE_ACCOUNT`.

Replace the placeholders in the variables below, then run the commands once per environment.

```sh
export PROJECT_ID=your-project
export REGION=europe-west2
export SERVICE=event-planner-backend          # the Cloud Run service name
export QUEUE=ai-tasks
export TASKS_SA_NAME=ai-tasks-invoker
export TASKS_SA=${TASKS_SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com
```

## 1. Enable the API

```sh
gcloud services enable cloudtasks.googleapis.com --project $PROJECT_ID
```

## 2. Create the queue

`--max-attempts=3` is only a backstop: the database `attempts` column is the source of truth for
retries. `--max-concurrent-dispatches` limits how many AI tasks run at once; the service runs one
gunicorn worker with 100 threads that also serve user traffic, so keep this modest.

```sh
gcloud tasks queues create $QUEUE \
  --project $PROJECT_ID --location $REGION \
  --max-attempts=3 \
  --min-backoff=5s --max-backoff=60s --max-doublings=3 \
  --max-concurrent-dispatches=10 \
  --max-dispatches-per-second=5
```

## 3. Service account that Cloud Tasks signs requests as

```sh
gcloud iam service-accounts create $TASKS_SA_NAME \
  --project $PROJECT_ID --display-name "AI task invoker"

# Lets the service account call the Cloud Run service.
gcloud run services add-iam-policy-binding $SERVICE \
  --project $PROJECT_ID --region $REGION \
  --member "serviceAccount:$TASKS_SA" --role roles/run.invoker
```

The identity the **backend runs as** must be allowed to enqueue tasks and to name the service
account on them:

```sh
export RUNTIME_SA=$(gcloud run services describe $SERVICE \
  --project $PROJECT_ID --region $REGION --format 'value(spec.template.spec.serviceAccountName)')

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member "serviceAccount:$RUNTIME_SA" --role roles/cloudtasks.enqueuer

gcloud iam service-accounts add-iam-policy-binding $TASKS_SA \
  --project $PROJECT_ID \
  --member "serviceAccount:$RUNTIME_SA" --role roles/iam.serviceAccountUser
```

## 4. Cloud Run settings

The task dispatch deadline is 15 minutes (`CloudTasksSettings.dispatch_deadline_seconds`), so the
request timeout must be at least that. The Dockerfile already runs gunicorn with `--timeout 0`.

```sh
gcloud run services update $SERVICE \
  --project $PROJECT_ID --region $REGION \
  --timeout=900
```

If the service is public (`--allow-unauthenticated`) nothing else is needed: the route still
rejects requests without a valid token. If it requires authentication, the `run.invoker` binding in
step 3 is what lets Cloud Tasks through.

## 5. Environment variables

| Variable | Value |
|---|---|
| `AI_TASK_DISPATCHER` | `cloud_tasks` (default when `ENVIRONMENT=PROD`). `thread` runs tasks in-process for local dev; `inline` runs them before the request returns (tests) |
| `GCP_PROJECT` | `$PROJECT_ID` |
| `GCP_LOCATION` | `$REGION` (the queue's location) |
| `CLOUD_TASKS_QUEUE` | `$QUEUE` |
| `CLOUD_TASKS_SERVICE_ACCOUNT` | `$TASKS_SA` |
| `SERVICE_BASE_URL` | Public URL of the service, no trailing slash (the callback host and the OIDC audience), for example `https://event-planner-backend-xxxx.a.run.app` |

```sh
gcloud run services update $SERVICE \
  --project $PROJECT_ID --region $REGION \
  --update-env-vars AI_TASK_DISPATCHER=cloud_tasks,GCP_PROJECT=$PROJECT_ID,GCP_LOCATION=$REGION,CLOUD_TASKS_QUEUE=$QUEUE,CLOUD_TASKS_SERVICE_ACCOUNT=$TASKS_SA,SERVICE_BASE_URL=https://YOUR-SERVICE-URL
```

`SERVICE_BASE_URL` must match the host Cloud Tasks calls. If you put a custom domain in front,
use that domain here, because it is both the URL and the token audience.

## 6. Database

Apply the `ai_tasks` migration (`flask db upgrade`) before deploying the new revision.

## 7. Smoke test

1. Queue an AI task from the app (for example "Fill in day").
2. `gcloud tasks queues describe $QUEUE --project $PROJECT_ID --location $REGION` shows the queue
   is `RUNNING`; `gcloud tasks list --queue=$QUEUE --location $REGION` shows in-flight tasks.
3. Cloud Run logs for `POST /api/internal/ai-tasks/<id>/run` should be `200`. A `401` means the
   token audience or service account does not match `SERVICE_BASE_URL` /
   `CLOUD_TASKS_SERVICE_ACCOUNT`; a `503` means the AI provider failed and Cloud Tasks will retry.
4. The task row ends as `ready` (a notification appears), `empty` or `failed`.

## Operating notes

- **Duplicate delivery** is safe: the runner claims a task with an atomic `UPDATE`, so a second
  delivery does nothing.
- **Crashed container**: a `running` task whose heartbeat is older than 5 minutes is reclaimed
  when Cloud Tasks retries. When no attempts are left it is marked `failed` the next time anyone
  reads it.
- **Cancelling** deletes the Cloud Task when it has not started; a running task notices the
  cancellation at its next progress report.
- **Cleanup**: proposals expire after 7 days; finished task rows are deleted 30 days later,
  whenever a new task is created.
- **Cost control**: lower `--max-concurrent-dispatches` or `--max-dispatches-per-second` to cap
  AI spend; the per-user cap (3 active tasks) and the route rate limits still apply.
