import type { Meta, StoryObj } from '@storybook/react';
import { Field, Input, Select, Textarea } from '@segevision/ui';

const meta: Meta<typeof Field> = {
  title: 'Foundation/Field',
  component: Field,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ maxWidth: 420 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof Field>;

export const TextInput: Story = {
  args: { label: 'שם מלא', required: true, children: <Input placeholder="איך לפנות אליכם?" /> },
};

/** The hint sits under the control so paired fields in a row keep their inputs aligned. */
export const WithHint: Story = {
  args: {
    label: 'טלפון',
    hint: 'לשם החזרה אליכם בלבד',
    children: <Input type="tel" dir="ltr" className="text-start" placeholder="050-0000000" />,
  },
};

/** An error sets aria-invalid on the control and announces itself via role="alert". */
export const WithError: Story = {
  args: {
    label: 'טלפון',
    error: 'נראה שנפלה טעות במספר. אפשר לבדוק שוב?',
    required: true,
    children: <Input type="tel" defaultValue="123" />,
  },
};

export const SelectControl: Story = {
  args: {
    label: 'מה מטריד אתכם?',
    required: true,
    children: (
      <Select defaultValue="">
        <option value="" disabled>
          בחרו אזור או נושא
        </option>
        <option value="back">גב</option>
        <option value="knee">ברך</option>
      </Select>
    ),
  },
};

export const TextareaControl: Story = {
  args: {
    label: 'רוצים להוסיף משהו?',
    hint: 'לא חובה, אבל זה עוזר לנו להתכונן',
    children: <Textarea placeholder="מתי זה התחיל ומה מחמיר" />,
  },
};

export const Disabled: Story = {
  args: { label: 'שדה מושבת', children: <Input disabled defaultValue="לא ניתן לעריכה" /> },
};
