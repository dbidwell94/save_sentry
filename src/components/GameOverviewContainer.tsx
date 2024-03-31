import { PropsWithChildren, forwardRef } from "react";

type NativeButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

type GameOverContainerProps = Omit<NativeButtonProps, "className">;

const GameOverviewContainer = forwardRef<HTMLButtonElement, PropsWithChildren<GameOverContainerProps>>(
  ({ children, ...buttonProps }, ref) => {
    return (
      <button
        className={`border h-40 w-40 lg:h-80 lg:w-80 p-5 rounded-md flex flex-col items-center
      justify-center hover:bg-slate-600 transition-all shadow-none shadow-slate-400 hover:shadow-md hover:shadow-slate-400
      active:shadow-none active:bg-slate-700`}
        ref={ref}
        {...buttonProps}
      >
        {children}
      </button>
    );
  },
);

GameOverviewContainer.displayName = "GameOverviewContainer";

export default GameOverviewContainer;
