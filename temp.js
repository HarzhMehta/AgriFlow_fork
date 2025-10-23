const executor = AgentExecutor.fromAgentAndTools({
  agent: async () => loadAgentFromLangchainHub(),
  tools: [new SerpAPI(), new Calculator()],
  returnIntermediateSteps: true,
});

const result = await executor.invoke({
  input: `Who is Olivia Wilde's boyfriend? What is his current age raised to the 0.23 power?`,
});