import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AppointmentForm, type AppointmentFormCopy } from '../../sections/AppointmentForm';

const copy: AppointmentFormCopy = {
  fullName: { label: 'שם מלא', error: 'שם חסר' },
  phone: { label: 'טלפון', error: 'טלפון שגוי' },
  topic: {
    label: 'נושא',
    placeholder: 'בחרו נושא',
    error: 'נושא חסר',
    options: [{ value: 'back', label: 'גב' }],
  },
  preferredTime: { label: 'זמן מועדף', placeholder: 'לא משנה', options: [{ value: 'am', label: 'בוקר' }] },
  message: { label: 'הודעה' },
  submit: 'שליחת בקשה',
  submitting: 'שולחים',
  success: { title: 'הבקשה נקלטה', body: 'נחזור אליכם', again: 'שליחה נוספת' },
};

function fill(values: { name?: string; phone?: string; topic?: string }) {
  if (values.name !== undefined) {
    fireEvent.change(screen.getByLabelText(/שם מלא/), { target: { value: values.name } });
  }
  if (values.phone !== undefined) {
    fireEvent.change(screen.getByLabelText(/טלפון/), { target: { value: values.phone } });
  }
  if (values.topic !== undefined) {
    fireEvent.change(screen.getByLabelText(/נושא/), { target: { value: values.topic } });
  }
}

describe('AppointmentForm', () => {
  it('blocks submission and reports every invalid field', () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<AppointmentForm title="קביעת תור" copy={copy} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: 'שליחת בקשה' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('שם חסר')).toBeInTheDocument();
    expect(screen.getByText('טלפון שגוי')).toBeInTheDocument();
    expect(screen.getByText('נושא חסר')).toBeInTheDocument();
    expect(screen.getByLabelText(/שם מלא/)).toHaveAttribute('aria-invalid', 'true');
  });

  it('rejects a phone number that is not a valid Israeli format', () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<AppointmentForm title="קביעת תור" copy={copy} onSubmit={onSubmit} />);

    fill({ name: 'ישראל ישראלי', phone: '12345', topic: 'back' });
    fireEvent.click(screen.getByRole('button', { name: 'שליחת בקשה' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('טלפון שגוי')).toBeInTheDocument();
  });

  it.each(['050-1234567', '0501234567', '+972501234567', '04 6860086'])(
    'accepts the way a real person types a number: %s',
    async (phone) => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      const { unmount } = render(<AppointmentForm title="קביעת תור" copy={copy} onSubmit={onSubmit} />);

      fill({ name: 'ישראל ישראלי', phone, topic: 'back' });
      fireEvent.click(screen.getByRole('button', { name: 'שליחת בקשה' }));

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
      expect(onSubmit.mock.calls[0][0]).toMatchObject({ fullName: 'ישראל ישראלי', phone, topic: 'back' });
      unmount();
    },
  );

  it('clears a field error as soon as the visitor edits that field', () => {
    render(<AppointmentForm title="קביעת תור" copy={copy} onSubmit={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'שליחת בקשה' }));
    expect(screen.getByText('שם חסר')).toBeInTheDocument();

    fill({ name: 'א' });
    expect(screen.queryByText('שם חסר')).not.toBeInTheDocument();
  });

  it('shows the honest confirmation state, framed as a request rather than a booking', async () => {
    render(<AppointmentForm title="קביעת תור" copy={copy} onSubmit={vi.fn().mockResolvedValue(undefined)} />);

    fill({ name: 'ישראל ישראלי', phone: '0501234567', topic: 'back' });
    fireEvent.click(screen.getByRole('button', { name: 'שליחת בקשה' }));

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('הבקשה נקלטה'));
    expect(screen.queryByRole('button', { name: 'שליחת בקשה' })).not.toBeInTheDocument();
  });

  it('surfaces the demo notice only when no submit handler is wired', async () => {
    render(<AppointmentForm title="קביעת תור" copy={copy} demoNotice="לא נשלח בפועל" />);

    fill({ name: 'ישראל ישראלי', phone: '0501234567', topic: 'back' });
    fireEvent.click(screen.getByRole('button', { name: 'שליחת בקשה' }));

    await waitFor(() => expect(screen.getByText('לא נשלח בפועל')).toBeInTheDocument());
  });
});
