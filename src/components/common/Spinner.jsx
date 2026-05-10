export default function Spinner({ className }) {
  return (
    <svg
      viewBox="0 0 47 47"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} animate-spin`}
    >
      <circle cx="23.5" cy="23.5" r="19" stroke="#EBE4D9" strokeWidth="4" />
      <path
        d="M23.5 4.5a19 19 0 0 1 19 19"
        stroke="#1D1B1A"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
