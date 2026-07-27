import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import { SignOutButton } from '@/components/layout/SignOutButton';
import { DashboardWrapper } from '@/components/layout/dashboard-wrapper';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/signin');

  const userProfile = (
    <div className="p-4 border-t border-border shrink-0">
      <div className="flex items-center gap-3 mb-3">
        {session.user?.image ? (
          <Image src={session.user.image} alt="Avatar" width={32} height={32} className="rounded-full" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-primary-foreground text-[12px] font-medium">
            {(session.user?.name ?? 'R')[0]}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-medium text-foreground truncate">
            {session.user?.name ?? 'Recruiter'}
          </p>
          <p className="text-[12px] text-muted-foreground truncate">
            {session.user?.email}
          </p>
        </div>
      </div>
      <SignOutButton />
    </div>
  );

  const userMenu = (
    <button aria-label="User Menu" className="flex items-center gap-2 pl-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-full">
      {session.user?.image ? (
        <Image src={session.user.image} alt="Avatar" width={32} height={32} className="rounded-full cursor-pointer" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-primary-foreground text-[12px] font-medium cursor-pointer">
          {(session.user?.name ?? 'R')[0]}
        </div>
      )}
    </button>
  );

  return (
    <DashboardWrapper userProfile={userProfile} userMenu={userMenu}>
      {children}
    </DashboardWrapper>
  );
}
