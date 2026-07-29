import {
  Section,
  Container,
  Heading,
  Text,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Stack,
  Grid,
  Button,
  Divider,
  Icon,
  Logo,
} from '@segevision/ui';
import { PhoneIcon, WhatsAppIcon, StarIcon, CheckIcon, MapPinIcon } from '@segevision/icons';
import { ThemeSwitcher } from './theme-switcher';

const services = [
  { title: 'פיזיותרפיה', desc: 'טיפול פרטני בבעיות שלד-שריר.' },
  { title: 'פיזיותרפיית ספורט', desc: 'שיקום פציעות ספורט לחובבים ומקצוענים.' },
  { title: 'פילאטיס קליני', desc: 'חיזוק וייצוב בהובלת פיזיותרפיסט.' },
];

export default function DemoPage() {
  return (
    <main>
      <ThemeSwitcher />

      <Section padding="lg" background="surface-alt">
        <Stack gap={4} align="start">
          <Logo name="Segevision Core" size="lg" />
          <Heading level={1} size="6xl">
            מערכת העיצוב של Segevision — הוכחת היתכנות
          </Heading>
          <Text size="lg" color="secondary">
            כל הרכיבים בעמוד הזה נבנו פעם אחת בחבילת <code>@segevision/ui</code> ומוצגים כאן
            בעיצוב תמה &quot;Medical&quot; — אותם רכיבים בדיוק ישרתו כל לקוח עתידי, בשינוי טוקנים בלבד.
          </Text>
          <Stack direction="row" gap={3} wrap>
            <Button size="lg">קביעת תור</Button>
            <Button size="lg" variant="secondary">
              <Icon icon={PhoneIcon} size={20} />
              04-6860086
            </Button>
            <Button size="lg" variant="ghost">
              <Icon icon={WhatsAppIcon} size={20} />
              WhatsApp
            </Button>
          </Stack>
        </Stack>
      </Section>

      <Section padding="md">
        <Heading level={2} className="mb-6">
          Buttons — variants × sizes × states
        </Heading>
        <Stack gap={4}>
          <Stack direction="row" gap={3} wrap>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </Stack>
          <Stack direction="row" gap={3} wrap align="center">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </Stack>
          <Stack direction="row" gap={3} wrap align="center">
            <Button disabled>Disabled</Button>
            <Button loading>Loading</Button>
            <Button iconOnly aria-label="Close">
              <Icon icon={CheckIcon} size={20} />
            </Button>
          </Stack>
        </Stack>
      </Section>

      <Divider />

      <Section padding="md" background="surface-alt">
        <Heading level={2} className="mb-6">
          Service Cards — Grid (mobile 1 → tablet 2 → desktop 3)
        </Heading>
        <Grid columns={3} gap={6}>
          {services.map((s) => (
            <Card key={s.title} interactive tabIndex={0}>
              <CardHeader>
                <Heading level={3} size="2xl">
                  {s.title}
                </Heading>
              </CardHeader>
              <CardBody>
                <Text color="secondary">{s.desc}</Text>
              </CardBody>
              <CardFooter>
                <Button size="sm" variant="ghost">
                  קרא עוד
                </Button>
              </CardFooter>
            </Card>
          ))}
        </Grid>
      </Section>

      <Divider />

      <Section padding="md">
        <Heading level={2} className="mb-6">
          Trust Numbers &amp; Icons
        </Heading>
        <Grid columns={4} gap={6}>
          <Stack align="center" gap={2}>
            <Icon icon={StarIcon} size={32} label="שנות ניסיון" />
            <Heading level={3} size="3xl">
              15+
            </Heading>
            <Text size="sm" color="secondary">
              שנות ניסיון
            </Text>
          </Stack>
          <Stack align="center" gap={2}>
            <Icon icon={CheckIcon} size={32} label="התמחות" />
            <Heading level={3} size="3xl">
              2
            </Heading>
            <Text size="sm" color="secondary">
              תחומי התמחות
            </Text>
          </Stack>
          <Stack align="center" gap={2}>
            <Icon icon={MapPinIcon} size={32} label="מיקום" />
            <Heading level={3} size="3xl">
              1
            </Heading>
            <Text size="sm" color="secondary">
              קליניקה בגבעת חיים
            </Text>
          </Stack>
          <Stack align="center" gap={2}>
            <Icon icon={PhoneIcon} size={32} label="זמינות" />
            <Heading level={3} size="3xl">
              24/7
            </Heading>
            <Text size="sm" color="secondary">
              WhatsApp זמין
            </Text>
          </Stack>
        </Grid>
      </Section>

      <Section padding="lg" background="inverse">
        <Container className="text-center">
          <Heading level={2} size="4xl" className="text-text-inverse">
            רכיב אחד. כל תמה. כל לקוח עתידי.
          </Heading>
          <Text color="inverse" size="lg" className="mt-2">
            שנו את התמה למעלה (Luxury, Fitness, Legal...) — שום רכיב בעמוד הזה לא משתנה בקוד.
          </Text>
        </Container>
      </Section>
    </main>
  );
}
