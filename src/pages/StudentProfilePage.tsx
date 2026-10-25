import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, UserCircle } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Form';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Spinner';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { services } from '@/services';
import { toAppError } from '@/utils/apiError';
import { profileSchema } from '@/utils/schemas';
import type { ProfileFormValues } from '@/utils/schemas';
import { formatDate } from '@/utils/format';

export function StudentProfilePage() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const { data: profile, error, loading, reload } = useAsyncData(
    () => services.users.getMe(),
    [],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: 'onBlur',
    defaultValues: { fullName: '', phone: '', bio: '' },
  });

  useEffect(() => {
    const source = profile ?? user;
    if (!source) return;
    reset({
      fullName: source.fullName ?? '',
      phone: source.phone ?? '',
      bio: source.bio ?? '',
    });
  }, [profile, user, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    setSaved(false);
    try {
      const updated = await services.users.updateMe({
        fullName: values.fullName.trim(),
        phone: values.phone?.trim() ?? '',
        bio: values.bio?.trim() ?? '',
      });
      setUser(updated);
      setSaved(true);
      toast.success('Profile updated', 'Your changes have been saved.');
    } catch (caught) {
      const appError = toAppError(caught);
      setSubmitError(appError.message);
    }
  });

  return (
    <div className="container-page py-10 sm:py-14">
      <PageHeader
        eyebrow="Account"
        title="My profile"
        description="Keep your contact details up to date so tutors can reach you about your sessions."
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[320px_1fr]">
        <aside>
          <Card className="p-6 text-center">
            {loading ? (
              <Skeleton className="mx-auto h-24 w-24 rounded-full" />
            ) : (
              <Avatar
                name={profile?.fullName ?? user?.fullName ?? 'User'}
                src={profile?.avatarUrl}
                size="xl"
                className="mx-auto"
              />
            )}
            <h2 className="mt-4 text-lg font-bold text-ink-900">
              {profile?.fullName ?? user?.fullName ?? 'Your profile'}
            </h2>
            <p className="mt-1 truncate text-sm text-ink-500">{profile?.email ?? user?.email}</p>
            <div className="mt-3 flex justify-center">
              <Badge tone="brand">{user?.role === 'TUTOR' ? 'Tutor' : 'Student'}</Badge>
            </div>
            {profile?.createdAt ? (
              <p className="mt-4 border-t border-ink-100 pt-4 text-xs text-ink-500">
                Member since {formatDate(profile.createdAt)}
              </p>
            ) : null}
          </Card>

          <Card className="mt-4 p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-ink-900">
              <UserCircle className="h-4 w-4 text-brand-600" aria-hidden="true" />
              About your account
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              Tutors see your name and the message you send with each booking request. Your email
              address is never shown to other learners.
            </p>
          </Card>
        </aside>

        <section aria-labelledby="profile-form-heading">
          <Card className="p-6 sm:p-8">
            <h2 id="profile-form-heading" className="text-lg font-bold text-ink-900">
              Edit your details
            </h2>

            {error ? (
              <Alert
                tone="error"
                title="We could not load your profile"
                className="mt-4"
                action={
                  <Button variant="outline" size="sm" onClick={reload}>
                    Try again
                  </Button>
                }
              >
                {error.message}
              </Alert>
            ) : null}

            {submitError ? (
              <Alert tone="error" title="We could not save your changes" className="mt-4">
                {submitError}
              </Alert>
            ) : null}

            {saved && !submitError ? (
              <Alert tone="success" title="Saved" className="mt-4">
                Your profile has been updated.
              </Alert>
            ) : null}

            <form onSubmit={onSubmit} noValidate className="mt-6 space-y-5">
              <Input
                label="Full name"
                autoComplete="name"
                error={errors.fullName?.message}
                required
                {...register('fullName')}
              />

              <Input
                label="Email address"
                type="email"
                value={profile?.email ?? user?.email ?? ''}
                readOnly
                disabled
                hint="Your email address is used to sign in and cannot be changed here."
              />

              <Input
                label="Phone number"
                type="tel"
                placeholder="+256 7XX XXX XXX"
                autoComplete="tel"
                optional
                error={errors.phone?.message}
                {...register('phone')}
              />

              <Textarea
                label="Short bio"
                optional
                rows={4}
                hint="Tell tutors which subjects and exam boards you are studying."
                placeholder="e.g. Senior 4 student preparing for UACE. Focused on Mathematics and Biology."
                error={errors.bio?.message}
                {...register('bio')}
              />

              <div className="flex flex-col gap-3 border-t border-ink-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-ink-500">
                  {isDirty ? 'You have unsaved changes.' : 'Everything is saved.'}
                </p>
                <Button type="submit" leftIcon={Save} loading={isSubmitting} disabled={!isDirty}>
                  {isSubmitting ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            </form>
          </Card>
        </section>
      </div>
    </div>
  );
}
