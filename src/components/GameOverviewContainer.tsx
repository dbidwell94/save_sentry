import { PropsWithChildren } from "react";

export default function GameOverviewContainer(props: PropsWithChildren) {
  return (
    <button
      className={`border h-80 w-80 p-5 rounded-md flex flex-col items-center
      justify-center hover:bg-slate-600 transition-all shadow-none shadow-slate-400 hover:shadow-md hover:shadow-slate-400
      active:shadow-none active:bg-slate-700`}
    >
      {props.children}
    </button>
  );
}
