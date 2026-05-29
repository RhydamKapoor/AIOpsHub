(() => {
  const divide = tool(
    async ({ a, b }) => {
      const x = Number(a);
      const y = Number(b);
      if (y === 0) {
        return "Error: cannot divide by zero";
      }
      const result = x / y;
      return `The quotient of ${x} divided by ${y} is ${result}`;
    },
    {
      name: "divide",
      description: "Divide the first number by the second",
      schema: z.object({
        a: z.number().describe("The dividend (number to be divided)"),
        b: z.number().describe("The divisor (number to divide by)"),
      }),
    }
  );

  global.toolNode = divide;
})();
