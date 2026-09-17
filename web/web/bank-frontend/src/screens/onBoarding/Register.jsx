import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, UserCircle, ShieldCheck, Landmark, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const Register = () => {
  const [formData, setFormData] = useState({
    bank_name: '',
    nationality: '',
    license_number: '',
    branch_code: '',
    admin_first_name: '',
    admin_last_name: '',
    admin_email: '',
    admin_password: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const tempErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const strictNameRegex = /^[a-zA-Z0-9\s'-]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    const pureSymbolsRegex = /^[^a-zA-Z0-9]+$/;

    if (!formData.bank_name.trim()) {
      tempErrors.bank_name = 'Institution name is required.';
    } else if (!strictNameRegex.test(formData.bank_name) || pureSymbolsRegex.test(formData.bank_name)) {
      tempErrors.bank_name = 'Bank name cannot contain special symbols.';
    }

    if (formData.nationality.trim() && pureSymbolsRegex.test(formData.nationality)) {
      tempErrors.nationality = 'Invalid nationality entry.';
    }

    if (formData.branch_code.trim() && pureSymbolsRegex.test(formData.branch_code)) {
      tempErrors.branch_code = 'Branch code cannot be composed entirely of symbols.';
    }

    if (!formData.license_number.trim()) {
      tempErrors.license_number = 'Banking license is required.';
    } else if (pureSymbolsRegex.test(formData.license_number)) {
      tempErrors.license_number = 'License number must contain valid alphanumeric characters.';
    }

    if (!formData.admin_first_name.trim()) {
      tempErrors.admin_first_name = 'First name required.';
    } else if (
      !strictNameRegex.test(formData.admin_first_name) ||
      pureSymbolsRegex.test(formData.admin_first_name)
    ) {
      tempErrors.admin_first_name = 'First name cannot contain symbols.';
    }

    if (!formData.admin_last_name.trim()) {
      tempErrors.admin_last_name = 'Last name required.';
    } else if (
      !strictNameRegex.test(formData.admin_last_name) ||
      pureSymbolsRegex.test(formData.admin_last_name)
    ) {
      tempErrors.admin_last_name = 'Last name cannot contain symbols.';
    }

    if (!emailRegex.test(formData.admin_email)) {
      tempErrors.admin_email = 'Please enter a valid corporate email address.';
    } else {
      const publicEmailDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];
      const domain = formData.admin_email.split('@')[1]?.toLowerCase();
      if (publicEmailDomains.includes(domain)) {
        tempErrors.admin_email = 'Please register using an official institutional email domain.';
      }
    }

    if (!passwordRegex.test(formData.admin_password)) {
      tempErrors.admin_password =
        'Password must be 8+ characters with at least one uppercase letter and one number.';
    }

    setErrors(tempErrors);

    if (Object.keys(tempErrors).length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Form Fields',
        text: 'Some entries contain invalid syntax. Please check highlighted errors.',
        confirmButtonColor: '#000000',
        customClass: { popup: 'rounded-2xl' },
      });
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleOnboarding = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/onboard/register-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Onboarding rejected.');

      Swal.fire({
        icon: 'success',
        title: 'Onboarding Authorized',
        text: `${formData.bank_name} infrastructure setup initiated successfully.`,
        confirmButtonColor: '#000000',
        customClass: { popup: 'rounded-2xl' },
      }).then(() => {
        navigate('/ingest-wizard', { state: { bankId: data.credentials.bank_id } });
      });
    } catch (err) {
      let friendlyMessage = 'Connection failed. Could not securely connect to server.';
      if (err.message.toLowerCase().includes('email')) {
        friendlyMessage = 'The administrator email is already mapped to an active institution.';
      } else if (err.message.toLowerCase().includes('license')) {
        friendlyMessage = 'The license structure could not be authenticated.';
      }

      Swal.fire({
        icon: 'error',
        title: 'Configuration Error',
        text: friendlyMessage,
        confirmButtonColor: '#000000',
        customClass: { popup: 'rounded-2xl' },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const ErrorLabel = ({ field }) =>
    errors[field] ? (
      <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-red-600">
        <AlertCircle className="h-3 w-3 flex-shrink-0" /> {errors[field]}
      </p>
    ) : null;

  const fieldClass = (field) =>
    cn(
      'w-full',
      errors[field] && 'border-red-500 ring-1 ring-red-500 focus-visible:ring-red-500'
    );

  return (
    <main className="flex min-h-screen w-full bg-canvas select-none">
      <div className="flex w-full flex-col justify-between px-6 py-8 md:px-12 lg:w-[45%] xl:px-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-lime shadow-sm">
            <Landmark className="h-4 w-4" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-black">
            CustomerIQ
          </span>
        </Link>

        <div className="my-auto py-10">
          <h2 className="text-3xl font-black tracking-tight text-black lg:text-4xl">
            Institution Onboarding
          </h2>
          <p className="mt-2 text-sm font-medium text-neutral-500">
            Initialize your bank node, admin account, and retention workspace.
          </p>

          <form className="mt-8 space-y-6" onSubmit={handleOnboarding}>
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-neutral-400">
                <Building2 className="h-3.5 w-3.5" /> Institutional Node
              </h3>

              <div>
                <Input
                  name="bank_name"
                  placeholder="Bank Name"
                  value={formData.bank_name}
                  onChange={handleChange}
                  className={fieldClass('bank_name')}
                />
                <ErrorLabel field="bank_name" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    name="nationality"
                    placeholder="Nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    className={fieldClass('nationality')}
                  />
                  <ErrorLabel field="nationality" />
                </div>
                <div>
                  <Input
                    name="branch_code"
                    placeholder="Branch Code"
                    value={formData.branch_code}
                    onChange={handleChange}
                    className={fieldClass('branch_code')}
                  />
                  <ErrorLabel field="branch_code" />
                </div>
              </div>

              <div>
                <Input
                  name="license_number"
                  placeholder="Banking License Number"
                  value={formData.license_number}
                  onChange={handleChange}
                  className={fieldClass('license_number')}
                />
                <ErrorLabel field="license_number" />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-neutral-400">
                <UserCircle className="h-3.5 w-3.5" /> Master Administrator
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    name="admin_first_name"
                    placeholder="First Name"
                    value={formData.admin_first_name}
                    onChange={handleChange}
                    className={fieldClass('admin_first_name')}
                  />
                  <ErrorLabel field="admin_first_name" />
                </div>
                <div>
                  <Input
                    name="admin_last_name"
                    placeholder="Last Name"
                    value={formData.admin_last_name}
                    onChange={handleChange}
                    className={fieldClass('admin_last_name')}
                  />
                  <ErrorLabel field="admin_last_name" />
                </div>
              </div>

              <div>
                <Input
                  name="admin_email"
                  type="email"
                  placeholder="Corporate Email Address"
                  value={formData.admin_email}
                  onChange={handleChange}
                  className={fieldClass('admin_email')}
                />
                <ErrorLabel field="admin_email" />
              </div>

              <div>
                <Input
                  name="admin_password"
                  type="password"
                  placeholder="System Access Password"
                  value={formData.admin_password}
                  onChange={handleChange}
                  className={fieldClass('admin_password')}
                />
                <ErrorLabel field="admin_password" />
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? 'Verifying Node Access…' : 'Authorize Onboarding'}
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm font-medium text-neutral-500">
            Already onboarded?{' '}
            <Link to="/login" className="font-black text-black hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <div className="flex items-center gap-2 border-t border-border pt-4 text-[11px] font-medium text-neutral-400">
          <ShieldCheck className="h-4 w-4" />
          <span>Protected under enterprise-grade cryptographic validation.</span>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-black lg:block lg:w-[55%]">
        <div className="absolute right-1/4 top-1/3 h-72 w-72 rounded-full bg-lime/50 blur-3xl animate-glow-pulse" />
        <div className="absolute inset-0 flex flex-col justify-end p-16">
          <div className="max-w-xl space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <Badge variant="lime">Enterprise Analytics</Badge>
            <h1 className="text-3xl font-black tracking-tight text-white">
              Advanced Customer Retentive Intelligence
            </h1>
            <p className="text-sm font-medium leading-relaxed text-neutral-300">
              Score churn risk, map value, and assign retention plans across your commercial book.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Register;
