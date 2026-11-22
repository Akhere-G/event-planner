import { featureScreenshot } from "../screenshot";
import type { FeaturePage } from "../types";

export const groupExpensesFeature: FeaturePage = {
  slug: "group-expenses",
  name: "Group expenses and splitting",
  title: "Split group trip costs and see who owes who",
  description:
    "Log shared costs in any currency, split them across the group and see balances in pounds, with suggested repayments so the trip ends square.",
  primaryKeyword: "split group trip costs",
  secondaryKeywords: [
    "who owes who app",
    "group holiday expense tracker",
    "stag do cost splitter",
    "hen do budget planner",
  ],
  screenshots: [
    featureScreenshot(
      "group-expenses-1",
      "Trip budget showing £461.63 spent of £600, spending by category, balances per person and suggested payments",
      "The budget view: spending by category, each person's balance and the repayments that settle the group.",
    ),
    featureScreenshot(
      "group-expenses-2",
      "Add expense form with description, currency, amount, date, category, payer, linked item and split options",
      "Record who paid, in which currency, and whether to split it with everyone, selected people or nobody.",
    ),
  ],
  summary:
    "Group expenses keep the money side of a trip in the same place as the plan. Record who paid, split it fairly, and TripTrack works out each person's balance in GBP and suggests who should pay whom.",
  steps: [
    {
      title: "Add an expense",
      body: "Enter what it was, the amount, the date, a category and who paid. Pay in euros, dollars or another supported currency and TripTrack converts it to pounds.",
    },
    {
      title: "Choose how to split it",
      body: "Split evenly between everyone, between selected people, or keep it as the payer's own cost.",
    },
    {
      title: "Link it to the plan",
      body: "Attach the cost to an event, accommodation or flight so the price shows on that card.",
    },
    {
      title: "Settle up",
      body: "Check the balances, follow the suggested payments and record repayments as people pay each other back.",
    },
  ],
  benefits: [
    "No more spreadsheet after the hen do: balances update as soon as someone adds a cost.",
    "Foreign-currency receipts keep their original amount, and the group total stays in pounds.",
    "Splits are calculated to the penny, and any rounding remainder goes to the payer rather than disappearing.",
    "Suggested payments pair people who owe with people who are owed, so settling up takes a few transfers instead of a group-chat argument.",
    "A budget bar shows how much of the trip budget has gone and where.",
  ],
  limits: [
    "TripTrack does not move money. Recording a payment updates the balances, but the transfer itself happens in your banking app.",
    "Balances and repayments are in GBP. Conversions use published reference rates for the spending date, which can differ from your card's rate.",
    "Each event, accommodation or flight can have one linked expense.",
    "Suggested payments use simple matching. They settle the balances but are not guaranteed to be the fewest possible transfers.",
  ],
  faqs: [
    {
      question: "Does TripTrack pay people back for me?",
      answer:
        "No. TripTrack shows who owes whom and lets you record a payment once it has been made. The money itself moves through your bank or payment app.",
    },
    {
      question: "Can I add costs in euros or other currencies?",
      answer:
        "Yes. Enter the amount in the currency you paid. TripTrack stores the original amount, converts it to GBP using the rate for the spending date and uses the GBP figure for balances.",
    },
    {
      question: "Can I split a cost between only some of the group?",
      answer:
        "Yes. Choose selected people when you add the expense, and only they share the cost.",
    },
    {
      question: "Who can add expenses for someone else?",
      answer:
        "Editors normally record costs they paid themselves. Trip admins can record a cost or a repayment on behalf of another member.",
    },
  ],
  relatedFeatureSlugs: ["collaboration-roles", "accommodation", "flight-search"],
  relatedArticleSlugs: ["how-to-plan-a-group-holiday", "best-travel-planning-apps"],
};
