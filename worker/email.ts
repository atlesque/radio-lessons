// The sign-in email, in English or Dutch, as plain text and simple HTML.

const COPY = {
  en: {
    subject: 'Your sign-in link for radio lessons',
    hello: 'Hi,',
    body: 'Click the button below to sign in to radio lessons and pick up your lessons where you left off. The link works once and expires in 15 minutes.',
    button: 'Sign in to radio lessons',
    ignore: "Didn't ask for this? You can ignore this email; nobody can sign in without the link.",
    footer: 'radio lessons · learn to listen with your Icom IC-R5',
  },
  nl: {
    subject: 'Je aanmeldlink voor radiolessen',
    hello: 'Hallo,',
    body: 'Klik op de knop hieronder om je aan te melden bij radiolessen en verder te gaan waar je gebleven was. De link werkt één keer en vervalt na 15 minuten.',
    button: 'Aanmelden bij radiolessen',
    ignore: 'Niet aangevraagd? Dan kun je deze e-mail negeren; zonder de link kan niemand zich aanmelden.',
    footer: 'radiolessen · leer luisteren met je Icom IC-R5',
  },
} as const;

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function signInEmail(lang: 'en' | 'nl', link: string) {
  const c = COPY[lang];
  const text = `${c.hello}\n\n${c.body}\n\n${link}\n\n${c.ignore}\n\n--\n${c.footer}\n`;
  const html = `<!doctype html>
<html lang="${lang}"><body style="margin:0;padding:24px;background:#f6f7f9;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:#142338">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border:1px solid #e2e6ec;border-radius:8px">
      <tr><td style="padding:28px 28px 8px;font-size:18px;font-weight:700">radio lessons<span style="color:#5f7a12">.</span></td></tr>
      <tr><td style="padding:8px 28px;font-size:15px;line-height:1.55">
        <p style="margin:0 0 12px">${escape(c.hello)}</p>
        <p style="margin:0 0 20px">${escape(c.body)}</p>
        <p style="margin:0 0 20px"><a href="${escape(link)}" style="display:inline-block;background:#172b45;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:6px">${escape(c.button)}</a></p>
        <p style="margin:0 0 20px;font-size:13px;color:#556174;word-break:break-all">${escape(link)}</p>
        <p style="margin:0 0 8px;font-size:13px;color:#556174">${escape(c.ignore)}</p>
      </td></tr>
      <tr><td style="padding:12px 28px 24px;font-size:12px;color:#6b778a">${escape(c.footer)}</td></tr>
    </table>
  </td></tr></table>
</body></html>`;
  return { subject: c.subject, text, html };
}
