(() => {
  const add = tool(
    async (a, b) => {
      return `${a + b}`;
    },
    {
      name: "add",
      description: "Add two numbers",
      schema: z.object({
        a: z.number().describe("The first number to add"),
        b: z.number().describe("The second number to add"),
      }),
    }
  );

  global.toolNode = add;
})();
