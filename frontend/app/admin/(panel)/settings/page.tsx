import { getConfig } from '@/app/admin/actions';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import ConfigForm from '../dashboard/ConfigForm';
import PasswordLock from '@/components/PasswordLock';

export default async function SettingsPage() {
    const session = (await cookies()).get('admin_session');
    if (!session) {
        redirect('/admin/login');
    }

    const config = await getConfig();

    return (
        <PasswordLock>
            <div className="space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">System Configuration</h1>
                    <p className="text-muted-foreground">Manage your API keys and system preferences.</p>
                </div>

                <div className="grid gap-6">
                     <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
                        <div className="p-6">
                            <ConfigForm initialConfig={config || {}} />
                        </div>
                     </div>
                </div>
            </div>
        </PasswordLock>
    );
}
