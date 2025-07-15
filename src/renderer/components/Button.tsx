import { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export const Button = (props: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className={twMerge(
      `bg-gray-800 disabled:bg-gray-700 rounded p-2 font-bold border-2
      border-transparent hover:not-disabled:border-white cursor-pointer
      disabled:cursor-not-allowed transition-all disabled:text-gray-400
      hover:not-disabled:scale-105`,
      props.className,
    )}
  ></button>
);
