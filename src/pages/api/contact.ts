import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const jsonHeaders = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  };

  try {
    const body = await request.json().catch(() => ({}));

    // 1. Honeypot check: silently discard spam bots
    if (body.website_url && String(body.website_url).trim().length > 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'Message received.' }),
        { status: 200, headers: jsonHeaders }
      );
    }

    // 2. Validate inputs
    const name = (body.name || '').trim();
    const email = (body.email || '').trim().toLowerCase();
    const phone = (body.phone || '').trim();
    const service = (body.service || 'General Inquiry').trim();
    const message = (body.message || '').trim();

    if (!name || name.length < 2 || name.length > 100) {
      return new Response(
        JSON.stringify({ success: false, message: 'Please provide a valid name (2-100 characters).' }),
        { status: 400, headers: jsonHeaders }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email) || email.length > 120) {
      return new Response(
        JSON.stringify({ success: false, message: 'Please provide a valid email address.' }),
        { status: 400, headers: jsonHeaders }
      );
    }

    if (!message || message.length < 5 || message.length > 3000) {
      return new Response(
        JSON.stringify({ success: false, message: 'Please provide a message (5-3000 characters).' }),
        { status: 400, headers: jsonHeaders }
      );
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
        name: name,
        email: email,
        phone: phone || 'Not provided',
        service: service,
        message: message,
      };

      const forwardRes = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(emailPayload),
      });

      if (!forwardRes.ok) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Email service delivery error. Please email us directly at ' + destinationEmail,
          }),
          { status: 502, headers: jsonHeaders }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Your inquiry has been received. Our team will contact you shortly.',
      }),
      { status: 200, headers: jsonHeaders }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'An internal error occurred. Please contact us at wisdomtechnosoft04@gmail.com',
      }),
      { status: 500, headers: jsonHeaders }
    );
  }
};
