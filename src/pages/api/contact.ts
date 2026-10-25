import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json().catch(() => ({}));

    // 1. Honeypot check: silently discard spam bots
    if (body.website_url && String(body.website_url).trim().length > 0) {
      return Response.json({ success: true, message: 'Message received.' });
    }

    // 2. Validate inputs
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const phone = String(body.phone || '').trim();
    const service = String(body.service || 'General Inquiry').trim();
    const message = String(body.message || '').trim();

    if (!name || name.length < 2 || name.length > 100) {
      return Response.json({ success: false, message: 'Please provide a valid name (2-100 characters).' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email) || email.length > 120) {
      return Response.json({ success: false, message: 'Please provide a valid email address.' }, { status: 400 });
    }

    if (!message || message.length < 5 || message.length > 3000) {
      return Response.json({ success: false, message: 'Please provide a message (5-3000 characters).' }, { status: 400 });
    }

    const env = (locals as Record<string, any>)?.runtime?.env || process.env;
    const destinationEmail = env?.DESTINATION_EMAIL || 'wisdomtechnosoft04@gmail.com';
    const formServiceKey = env?.FORM_SERVICE_KEY;

    // 3. Forward message if external service key is configured
    if (formServiceKey) {
      const emailPayload = {
        access_key: formServiceKey,
        subject: `New Inquiry from ${name} [${service}]`,
        from_name: 'Wisdom Technosoft Website',
        to_email: destinationEmail,
        name,
        email,
        phone: phone || 'Not provided',
        service,
        message,
      };

      const forwardRes = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(emailPayload),
      });

      if (!forwardRes.ok) {
        return Response.json({
          success: false,
          message: `Email service delivery error. Please email us directly at ${destinationEmail}`,
        }, { status: 502 });
      }
    }

    return Response.json({
      success: true,
      message: 'Your inquiry has been received. Our team will contact you shortly.',
    });
  } catch {
    return Response.json({
      success: false,
      message: 'Failed to process inquiry. Please email directly to wisdomtechnosoft04@gmail.com',
    }, { status: 500 });
  }
};
