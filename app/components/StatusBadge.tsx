type Props = {
  status: "Pending" | "Assigned" | "Reviewed";
};

export default function StatusBadge({ status }: Props) {
  const style =
    status === "Reviewed"
      ? "bg-emerald-100 text-emerald-700"
      : status === "Assigned"
        ? "bg-sky-100 text-sky-700"
        : "bg-amber-100 text-amber-700";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}>
      {status}
    </span>
  );
}
