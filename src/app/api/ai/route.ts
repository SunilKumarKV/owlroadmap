import { NextRequest, NextResponse } from 'next/server';

/** Maximum request body size we will proxy to Gemini (50 KB). */
const MAX_BODY_BYTES = 50 * 1024;

/** Allowed action identifiers. */
const ALLOWED_ACTIONS = new Set(['readme', 'roadmap', 'profile', 'improve']);

export async function POST(req: NextRequest) {
  try {
    // Guard against oversized bodies before parsing JSON
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Request body too large.' }, { status: 413 });
    }

    const body = await req.text();
    if (body.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Request body too large.' }, { status: 413 });
    }

    let parsed: { action?: unknown; payload?: unknown };
    try {
      parsed = JSON.parse(body);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const { action, payload } = parsed;

    // Strict allowlist check
    if (typeof action !== 'string' || !ALLOWED_ACTIONS.has(action)) {
      return NextResponse.json({ error: 'Invalid action specified.' }, { status: 400 });
    }

    if (!payload || typeof payload !== 'object') {
      return NextResponse.json({ error: 'Missing or invalid payload.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API Key is not configured on the server.', useLocalFallback: true },
        { status: 200 } // Return 200 so client knows it is a planned fallback check
      );
    }

    let prompt = '';
    if (action === 'readme') {
      const { profileData, repoData } = payload as any;
      prompt = `Analyze this profile: ${JSON.stringify(profileData)} and repo stats: ${JSON.stringify(
        repoData
      )}. Write developer README suggestions. Output strictly a JSON object with keys: introduction, aboutMe, skills, projects. Do not include markdown wraps or backticks outside of the JSON syntax itself.`;
    } else if (action === 'roadmap') {
      const { roadmapTitle, currentSteps } = payload as any;
      prompt = `Based on roadmap title "${roadmapTitle}" and current items: ${JSON.stringify(
        currentSteps
      )}, suggest learning roadmap improvements. Return strictly a JSON object matching keys: nextTopics (array of strings), technologies (array of strings), roadmapSteps (array of strings). Do not include markdown wraps or backticks outside of the JSON syntax itself.`;
    } else if (action === 'profile') {
      const { profileData, repoData } = payload as any;
      prompt = `Analyze this profile: ${JSON.stringify(profileData)} and repo stats: ${JSON.stringify(
        repoData
      )}. Write profile optimization advice. Return strictly a JSON object matching keys: improvedBio, portfolioDescription, githubImprovements (array of strings). Do not include markdown wraps or backticks outside of the JSON syntax itself.`;
    } else if (action === 'improve') {
      const { text, tone, type } = payload as any;
      prompt = `Rewrite the following text: "${text}". Make it fit the tone "${tone}". It belongs to the "${type}" section of a developer GitHub profile README. Output strictly a JSON object with a single key "alternatives" which is an array of 3 distinct, high-quality rephrased alternatives. Do not include markdown wraps or backticks outside of the JSON syntax itself.`;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API call failed:', errorText);
      return NextResponse.json(
        { error: 'Failed to communicate with Gemini API.', useLocalFallback: true },
        { status: 500 }
      );
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parse to ensure it is valid JSON before returning
    try {
      const parsedResult = JSON.parse(text.trim());
      return NextResponse.json({ data: parsedResult });
    } catch (parseErr) {
      console.error('Failed to parse Gemini output text:', text, parseErr);
      return NextResponse.json(
        { error: 'Invalid JSON response received from AI model.', useLocalFallback: true },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error('Error in secure AI Route handler:', err);
    return NextResponse.json(
      { error: err.message || 'An internal server error occurred.', useLocalFallback: true },
      { status: 500 }
    );
  }
}

