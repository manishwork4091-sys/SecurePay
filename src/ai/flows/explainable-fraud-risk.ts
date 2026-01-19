'use server';
/**
 * @fileOverview A fraud risk explanation AI agent.
 *
 * - explainFraudRisk - A function that handles the fraud risk explanation process.
 * - ExplainFraudRiskInput - The input type for the explainFraudRisk function.
 * - ExplainFraudRiskOutput - The return type for the explainFraudRisk function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainFraudRiskInputSchema = z.object({
  transactionDetails: z.string().describe('The details of the transaction that was flagged.'),
  riskScore: z.number().describe('The overall risk score assigned to the transaction.'),
  flaggingReasons: z.array(z.string()).describe('The reasons why the transaction was flagged.'),
});
export type ExplainFraudRiskInput = z.infer<typeof ExplainFraudRiskInputSchema>;

const ExplainFraudRiskOutputSchema = z.object({
  explanation: z.string().describe('A detailed explanation of why the transaction was flagged as potentially fraudulent, tailored to the user.'),
});
export type ExplainFraudRiskOutput = z.infer<typeof ExplainFraudRiskOutputSchema>;

export async function explainFraudRisk(input: ExplainFraudRiskInput): Promise<ExplainFraudRiskOutput> {
  return explainFraudRiskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainFraudRiskPrompt',
  input: {schema: ExplainFraudRiskInputSchema},
  output: {schema: ExplainFraudRiskOutputSchema},
  prompt: `You are an expert in financial fraud detection. Your task is to explain to the user why a particular transaction was flagged as potentially fraudulent.

  Provide a clear, concise, and easy-to-understand explanation based on the following information:

  Transaction Details: {{{transactionDetails}}}
  Risk Score: {{{riskScore}}}
  Flagging Reasons:
  {{#each flaggingReasons}}
  - {{{this}}}
  {{/each}}

  Compose your explanation to help the user understand the risk assessment and how their transaction behavior contributed to the flagging. Avoid technical jargon and focus on practical implications.
  `,
});

const explainFraudRiskFlow = ai.defineFlow(
  {
    name: 'explainFraudRiskFlow',
    inputSchema: ExplainFraudRiskInputSchema,
    outputSchema: ExplainFraudRiskOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
