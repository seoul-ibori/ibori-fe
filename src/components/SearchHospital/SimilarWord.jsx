export default function SimilarWord({ word, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(word)}
      className="flex w-full items-center gap-5 px-6.25 py-2.5 text-left"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#b9b2a6]">
        <svg
          className="size-5.25"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M24.2668 24.2648L17.3335 17.3315M3.4668 11.5537C3.4668 12.616 3.67602 13.6678 4.08253 14.6492C4.48903 15.6306 5.08485 16.5223 5.83598 17.2734C6.5871 18.0246 7.47881 18.6204 8.4602 19.0269C9.44159 19.4334 10.4934 19.6426 11.5557 19.6426C12.6179 19.6426 13.6698 19.4334 14.6512 19.0269C15.6326 18.6204 16.5243 18.0246 17.2754 17.2734C18.0265 16.5223 18.6223 15.6306 19.0288 14.6492C19.4353 13.6678 19.6446 12.616 19.6446 11.5537C19.6446 10.4915 19.4353 9.43964 19.0288 8.45825C18.6223 7.47686 18.0265 6.58515 17.2754 5.83402C16.5243 5.0829 15.6326 4.48708 14.6512 4.08057C13.6698 3.67407 12.6179 3.46484 11.5557 3.46484C10.4934 3.46484 9.44159 3.67407 8.4602 4.08057C7.47881 4.48708 6.5871 5.0829 5.83598 5.83402C5.08485 6.58515 4.48903 7.47686 4.08253 8.45825C3.67602 9.43964 3.4668 10.4915 3.4668 11.5537Z"
            stroke="white"
            strokeWidth="2.31111"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-[15px] font-medium text-[#3d3835]">{word}</span>
    </button>
  );
}
