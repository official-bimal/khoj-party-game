export function Mascot({ small = false }: { small?: boolean }) {
  return (
    <svg
      className={small ? "mascot small" : "mascot"}
      viewBox="0 0 400 360"
      fill="none"
      role="img"
      aria-label="Khoj's mischievous masked detective"
    >
      <ellipse cx="207" cy="324" rx="115" ry="16" fill="#101426" opacity=".2" />
      <path
        d="M114 287c-7-50 2-118 37-142 22-15 88-14 112 5 35 27 40 87 25 139l-37 18-27-12-31 18-32-16-29 11z"
        fill="#8572f4"
        stroke="#292344"
        strokeWidth="6"
      />
      <path
        d="M153 157c-28-41-11-95 40-110 49-15 92 19 91 68-1 26-18 46-35 56"
        fill="#b4a2ff"
        stroke="#292344"
        strokeWidth="6"
      />
      <path
        d="M135 152c21-43 120-54 149-9 3 26-5 62-28 77-31 20-74 13-99-9-16-14-27-41-22-59z"
        fill="#292344"
      />
      <path
        d="M153 159c16-16 34-16 50-3-7 29-40 28-50 3zm63-4c18-15 38-14 50 0-6 27-37 31-50 0z"
        fill="#f8f1df"
      />
      <ellipse cx="183" cy="163" rx="7" ry="12" fill="#292344" />
      <ellipse cx="236" cy="162" rx="7" ry="12" fill="#292344" />
      <path
        d="M198 194q17 13 29-2"
        stroke="#e6dbff"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="m133 129 23-42 93-8 39 34c-47-3-97 4-155 16z"
        fill="#ff8e79"
        stroke="#292344"
        strokeWidth="6"
      />
      <path
        d="m160 89 6-45q37-30 66-1l15 36"
        fill="#ffad94"
        stroke="#292344"
        strokeWidth="6"
      />
      <path d="m163 76 78-5" stroke="#292344" strokeWidth="13" />
      <path
        d="M116 221q-47 1-38 45l44-4m158-36q44-32 56 2"
        fill="#8572f4"
        stroke="#292344"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle
        cx="327"
        cy="206"
        r="33"
        fill="#e0fff1"
        fillOpacity=".45"
        stroke="#292344"
        strokeWidth="7"
      />
      <path
        d="m305 230-25 32"
        stroke="#292344"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path
        d="m321 188 12 14"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="m79 75 6-14 7 14 14 6-14 6-7 14-6-14-14-6zM312 73l4-10 5 10 10 5-10 4-5 11-4-11-11-4z"
        fill="#292344"
      />
      <path
        d="m56 200 11-7m270 89 9 8"
        stroke="#292344"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
