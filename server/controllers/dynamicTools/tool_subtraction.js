(() => {
  const subtract = tool(
    async ({ a, b }) => {
      const x = Number(a);
      const y = Number(b);
      const result = x - y;
      return `The difference of ${x} minus ${y} is ${result}`;
    },
    {
      name: "subtract",
      description: "Subtract the second number from the first",
      schema: z.object({
        a: z.number().describe("The number to subtract from"),
        b: z.number().describe("The number to subtract"),
      }),
    }
  );

  global.toolNode = subtract;
})();
