import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { StyleGuideDocument } from '@/lib/pdf/StyleGuideDocument';
import type { StyleGuideData } from '@/types/style-guide';
import React from 'react';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data } = body as { data: StyleGuideData };

    if (!data) {
      return NextResponse.json({ error: 'Style guide data is required' }, { status: 400 });
    }

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
      React.createElement(StyleGuideDocument, { data }) as React.ReactElement
    );

    // Return the PDF as a downloadable file
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${data.meta.domain}-style-guide.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
