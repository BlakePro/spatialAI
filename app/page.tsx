import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { CameraPose } from '@components/CameraPose';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr';
import { ButtonTheme } from '@components/Button';

export const metadata: Metadata = {
  title: 'Demo',
  description: '',
};

export default function Index(): ReactNode {
  return (
    <>
      <CameraPose />
      <div className="w-full absolute bottom-3 px-3 flex flex-row justify-between">
        <div>
          <a href="https://github.com/" target="_blank" rel="nofollow" className="hover:bg-gradient-to-r hover:text-white hover:from-violet-600 hover:to-indigo-600 flex justify-center items-center gap-1 rounded-full bg-slate-50 dark:bg-black text-black dark:text-white px-2.5 py-1">
            <div>Github</div>
            <div><ArrowUpRight className="size-5" /></div>
          </a>
        </div>
        <div>
          <ButtonTheme />
        </div>
      </div>
    </>
  )
}