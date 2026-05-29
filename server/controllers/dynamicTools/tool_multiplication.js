(() => {
  const multiply = tool(
    async ({ a, b }) => {
      const x = Number(a);
      const y = Number(b);
      const result = x * y;
      return `The product of ${x} and ${y} is ${result}`;
    },
    {
      name: "multiply",
      description: "Multiply two numbers together",
      schema: z.object({
        a: z.number().describe("The first number"),
        b: z.number().describe("The second number"),
      }),
    }
  );

  global.toolNode = multiply;
})();
