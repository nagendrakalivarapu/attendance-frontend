import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FormSection, NativeSelect } from "./primitives";
export const emptyStudentForm = {
    fullName: "",
    email: "",
    password: "",
    registrationNumber: "",
    department: "",
    semester: "",
    section: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
};
export function StudentForm({ initial, mode, saving, onSubmit, onCancel, }) {
    const [form, setForm] = React.useState(initial);
    React.useEffect(() => setForm(initial), [initial]);
    const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    return (<form className="space-y-8" onSubmit={(e) => {
            e.preventDefault();
            onSubmit(form);
        }}>
      <FormSection title="Student account">
        <Field label="Full name" htmlFor="fullName" required>
          <Input id="fullName" name="fullName" placeholder="Rahul Sharma" value={form.fullName} onChange={change} required/>
        </Field>
        <Field label="Email" htmlFor="email" required>
          <Input id="email" name="email" type="email" placeholder="rahul@gmail.com" value={form.email} onChange={change} required/>
        </Field>
        <Field label={mode === "edit" ? "New password" : "Password"} htmlFor="password" required={mode === "create"} hint={mode === "edit" ? "Leave blank if you don't want to change the password." : undefined}>
          <Input id="password" name="password" type="password" placeholder={mode === "edit" ? "Leave blank to keep current password" : "Enter password"} value={form.password} onChange={change} required={mode === "create"}/>
        </Field>
      </FormSection>

      <div className="h-px bg-border"/>

      <FormSection title="Student information">
        <Field label="Registration number" htmlFor="registrationNumber" required>
          <Input id="registrationNumber" name="registrationNumber" placeholder="12314516" value={form.registrationNumber} onChange={change} required/>
        </Field>
        <Field label="Department" htmlFor="department" required>
          <Input id="department" name="department" placeholder="CSE" value={form.department} onChange={change} required/>
        </Field>
        <Field label="Semester" htmlFor="semester" required>
          <Input id="semester" name="semester" type="number" min={1} max={12} value={form.semester} onChange={change} required/>
        </Field>
        <Field label="Section" htmlFor="section" required>
          <Input id="section" name="section" placeholder="A" value={form.section} onChange={change} required/>
        </Field>
        <Field label="Phone" htmlFor="phone" required>
          <Input id="phone" name="phone" type="tel" placeholder="9876543210" value={form.phone} onChange={change} required/>
        </Field>
        <Field label="Date of birth" htmlFor="dateOfBirth">
          <Input id="dateOfBirth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={change}/>
        </Field>
        <Field label="Gender" htmlFor="gender">
          <NativeSelect id="gender" name="gender" value={form.gender} onChange={change}>
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </NativeSelect>
        </Field>
        <Field label="Address" htmlFor="address" className="sm:col-span-2">
          <Textarea id="address" name="address" rows={3} placeholder="Enter student's address" value={form.address} onChange={change}/>
        </Field>
      </FormSection>

      <div className="flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="animate-spin"/>}
          {mode === "edit"
            ? saving
                ? "Saving changes…"
                : "Save changes"
            : saving
                ? "Creating student…"
                : "Create student"}
        </Button>
      </div>
    </form>);
}
