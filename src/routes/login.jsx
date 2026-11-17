import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeOff, Loader2, LockKeyhole, Mail, ShieldCheck, ScanFace, BarChart3, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { BrandMark } from "@/components/app/brand";
import { Field, InlineAlert } from "@/components/app/primitives";
import { ServerSettings } from "@/components/app/server-settings";
import { errorMessage } from "@/lib/api";
import { homeForRole, useAuth } from "@/lib/auth";
export const Route = createFileRoute("/login")({
    head: () => ({
        meta: [
            { title: "Sign in · Smart Attendance" },
            {
                name: "description",
                content: "Sign in to Smart Attendance as an administrator, teacher or student.",
            },
            { property: "og:title", content: "Sign in · Smart Attendance" },
            {
                property: "og:description",
                content: "Sign in to Smart Attendance as an administrator, teacher or student.",
            },
            { property: "og:type", content: "website" },
            { name: "twitter:card", content: "summary_large_image" },
        ],
    }),
    component: LoginPage,
});
const RESEND_SECONDS = 60;
function LoginPage() {
    const navigate = useNavigate();
    const { user, ready, login, verifyOtp, resendOtp } = useAuth();
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [otp, setOtp] = React.useState("");
    const [step, setStep] = React.useState("login");
    const [role, setRole] = React.useState("");
    const [error, setError] = React.useState("");
    const [success, setSuccess] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [resending, setResending] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const [countdown, setCountdown] = React.useState(0);
    // Already signed in: go straight to the right workspace.
    React.useEffect(() => {
        const home = homeForRole(user?.role);
        if (ready && home)
            void navigate({ to: home, replace: true });
    }, [ready, user, navigate]);
    React.useEffect(() => {
        if (countdown <= 0)
            return;
        const timer = window.setInterval(() => setCountdown((p) => Math.max(p - 1, 0)), 1000);
        return () => window.clearInterval(timer);
    }, [countdown]);
    const goHome = (userRole) => {
        const home = homeForRole(userRole);
        if (home)
            void navigate({ to: home, replace: true });
        else
            setError("Unknown user role.");
    };
    const handleLogin = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);
        try {
            const data = await login(email.trim(), password);
            if (data.requiresOtp) {
                setRole(data.role ?? "");
                setStep("otp");
                setOtp("");
                setCountdown(RESEND_SECONDS);
                setSuccess(data.message || "A verification code has been sent to your email.");
                return;
            }
            goHome(data.role);
        }
        catch (err) {
            setError(errorMessage(err, "Login failed. Check your email and password."));
        }
        finally {
            setLoading(false);
        }
    };
    const handleVerify = async (event) => {
        event?.preventDefault();
        setError("");
        setSuccess("");
        if (!/^\d{6}$/.test(otp)) {
            setError("Please enter the 6-digit verification code.");
            return;
        }
        setLoading(true);
        try {
            const data = await verifyOtp(email.trim(), otp);
            setSuccess(data.message || "Verification successful.");
            goHome(data.role);
        }
        catch (err) {
            setError(errorMessage(err, "Invalid or expired OTP."));
        }
        finally {
            setLoading(false);
        }
    };
    const handleResend = async () => {
        if (countdown > 0)
            return;
        setError("");
        setSuccess("");
        setResending(true);
        try {
            const data = await resendOtp(email.trim());
            setOtp("");
            setCountdown(RESEND_SECONDS);
            setSuccess(data?.message || "A new verification code has been sent.");
        }
        catch (err) {
            setError(errorMessage(err, "Unable to resend OTP."));
        }
        finally {
            setResending(false);
        }
    };
    const backToLogin = () => {
        setStep("login");
        setOtp("");
        setError("");
        setSuccess("");
        setCountdown(0);
    };
    return (<div className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="bg-grid-faint absolute inset-0" aria-hidden/>
        <div className="relative flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary-foreground/10 ring-1 ring-primary-foreground/20">
            <ScanFace className="size-5"/>
          </span>
          <span className="text-lg font-bold tracking-tight">Smart Attendance</span>
        </div>
        <div className="relative max-w-md space-y-6">
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight">
            Attendance that verifies itself.
          </h1>
          <p className="text-[0.9375rem] leading-relaxed text-primary-foreground/70">
            Teachers open a session, students check in with their face, and every record lands in
            one place for reports and follow-up.
          </p>
          <ul className="space-y-3 text-sm">
            {[
            { icon: ScanFace, text: "Live face detection before every check-in" },
            { icon: ShieldCheck, text: "One-time email codes for staff sign-in" },
            { icon: BarChart3, text: "Course-wise reports and low attendance alerts" },
        ].map(({ icon: Icon, text }) => (<li key={text} className="flex items-center gap-3 text-primary-foreground/85">
                <span className="flex size-8 items-center justify-center rounded-md bg-primary-foreground/10">
                  <Icon className="size-4"/>
                </span>
                {text}
              </li>))}
          </ul>
        </div>
        <p className="relative text-xs text-primary-foreground/50">
          Administrators · Teachers · Students
        </p>
      </aside>

      {/* Form */}
      <main className="flex flex-col items-center justify-center px-5 py-10">
        <div className="w-full max-w-[400px] animate-rise">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <BrandMark />
            <span className="text-lg font-bold">Smart Attendance</span>
          </div>

          <div className="rounded-2xl border bg-card p-7 shadow-panel sm:p-8">
            {step === "login" ? (<form onSubmit={handleLogin} className="space-y-5" key="login">
                <div className="space-y-1">
                  <p className="eyebrow">Welcome back</p>
                  <h2 className="text-2xl font-bold">Sign in</h2>
                  <p className="text-sm text-muted-foreground">
                    Use the email and password from your school.
                  </p>
                </div>

                {error && <InlineAlert tone="destructive">{error}</InlineAlert>}
                {success && <InlineAlert>{success}</InlineAlert>}

                <Field label="Email" htmlFor="email">
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" autoComplete="email" required className="pl-9"/>
                  </div>
                </Field>

                <Field label="Password" htmlFor="password">
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
                    <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" required className="px-9"/>
                    <button type="button" onClick={() => setShowPassword((p) => !p)} aria-label={showPassword ? "Hide password" : "Show password"} className="pressable absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-primary">
                      {showPassword ? <EyeOff className="size-4"/> : <Eye className="size-4"/>}
                    </button>
                  </div>
                </Field>

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="animate-spin"/>}
                  {loading ? "Signing in…" : "Sign in"}
                </Button>
              </form>) : (<form onSubmit={handleVerify} className="space-y-5" key="otp">
                <div className="space-y-1">
                  <p className="eyebrow">
                    {role === "ADMIN" ? "Administrator verification" : "Teacher verification"}
                  </p>
                  <h2 className="text-2xl font-bold">Verify your identity</h2>
                  <p className="text-sm text-muted-foreground">
                    Enter the 6-digit code sent to{" "}
                    <span className="font-semibold text-foreground">{email}</span>
                  </p>
                </div>

                {error && <InlineAlert tone="destructive">{error}</InlineAlert>}
                {success && <InlineAlert>{success}</InlineAlert>}

                <div className="space-y-1.5">
                  <label className="text-[0.8125rem] font-medium">Verification code</label>
                  <InputOTP maxLength={6} value={otp} onChange={(v) => setOtp(v.replace(/\D/g, "").slice(0, 6))} autoFocus inputMode="numeric" autoComplete="one-time-code" containerClassName="justify-between">
                    <InputOTPGroup className="w-full gap-2">
                      {Array.from({ length: 6 }).map((_, i) => (<InputOTPSlot key={i} index={i} className="h-12 flex-1 rounded-lg border bg-card font-mono text-lg font-semibold shadow-panel first:rounded-lg"/>))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={loading || otp.length !== 6}>
                  {loading && <Loader2 className="animate-spin"/>}
                  {loading ? "Verifying…" : "Verify code"}
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <Button type="button" variant="ghost" size="sm" onClick={backToLogin}>
                    <ArrowLeft /> Back
                  </Button>
                  {countdown > 0 ? (<span className="text-muted-foreground">
                      Resend in{" "}
                      <span className="font-mono font-semibold text-foreground">{countdown}s</span>
                    </span>) : (<Button type="button" variant="link" size="sm" onClick={handleResend} disabled={resending}>
                      {resending ? "Sending…" : "Resend code"}
                    </Button>)}
                </div>
              </form>)}
          </div>

          <div className="mt-4 flex justify-center">
            <ServerSettings />
          </div>
        </div>
      </main>
    </div>);
}
