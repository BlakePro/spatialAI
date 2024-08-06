import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { CameraPose } from '@components/CameraPose';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr';
import { ButtonTheme } from '@components/Button';
import { headers } from 'next/headers';
import { getPreferredLanguage } from "@utilities/tools";

export const metadata: Metadata = {
  title: 'SpatialAI',
  description: '',
};

export default function Page(): ReactNode {
  const headersList: any = headers();
  const acceptLanguage = headersList.get('accept-language');
  let lang = getPreferredLanguage(acceptLanguage);
  if (lang == 'lang') lang = 'es-MX';

  return (
    <>
      <CameraPose lang={lang} />
      <div className="w-full absolute bottom-3 px-3 flex flex-row justify-between">
        <div>
          <a href="https://github.com/BlakePro/spatialAI" target="_blank" rel="nofollow" className="bg-white dark:bg-slate-900 hover:bg-gradient-to-r hover:text-white hover:from-violet-600 hover:to-indigo-600 flex justify-center items-center gap-1 rounded-full text-black dark:text-white px-2.5 py-1">
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