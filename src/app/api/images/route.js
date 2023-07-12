import { NextResponse } from 'next/server';
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  organization: process.env.OPENAI_ORGANIZATION,
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function GET() {
  const response = await openai.createImage({
    prompt:
      'A white hairy ghost family smiles for a selfie, camera looking up, in some place in the universe',
    n: 1,
    size: '512x512',
  });

  //   res.status(200).json({ data: response.data.data })

  return NextResponse.json({ data: response.data.data });
}
