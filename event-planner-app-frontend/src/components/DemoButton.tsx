import useDemoButton from "../hooks/useDemoButton";

export default function DemoButton() {
  const { demoResult, onTryDemo } = useDemoButton();

  return (
    <button
      type="button"
      className="btn-secondary"
      onClick={onTryDemo}
      disabled={demoResult.isLoading}
    >
      Try the demo
    </button>
  );
}
