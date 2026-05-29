import { LineChartComp } from '@/components/charts/LineChart'
import ModelsChart from '@/components/charts/ModelsChart'
import { WorkflowUsageBar } from '@/components/charts/WorkflowUsageBar'
import { useAuthStore } from '@/store/useAuthStore'
import axiosInstance from "@/utils/axiosConfig";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { isSameUser } from "@/utils/resolveUserId";

export default function Dashboard() {
  const {user} = useAuthStore()  
  const [workflows, setWorkflows] = useState([])
  const [tokenUsage, setTokenUsage] = useState({
    totalTokenUsage: 0,
    totalTokenCost: 0,
  })
  const [loading, setLoading] = useState(false)

  const fetchTokenData = (workflows) => {
     // Group workflows by weekday
    const weeklyUsage = workflows.reduce((acc, workflow) => {
      // Get the weekday from 'createdAt' (0 is Sunday, 6 is Saturday)
      const date = new Date(workflow.createdAt);
      const weekday = date.toLocaleString('en-US', { weekday: 'long' }); // "Monday", "Tuesday", etc.

      // Sum up tokens for the current workflow
      const step0 = workflow?.steps[0]?.tokenUsage?.totalTokens || 0;
      const step1 = workflow?.steps[1]?.tokenUsage?.totalTokens || 0;
      const step2 = workflow?.steps[2]?.tokenUsage?.totalTokens || 0;
      const totalTokensForWorkflow = step0 + step1 + step2;

      // If the weekday is already in the accumulator, add to the token usage, otherwise, set it
      if (acc[weekday]) {
        acc[weekday].totalTokenUsage += totalTokensForWorkflow;
      } else {
        acc[weekday] = { weekday, totalTokenUsage: totalTokensForWorkflow };
      }

      return acc;
    }, {});

    // Convert weeklyUsage object to an array of objects
    const weeklyTokenUsage = Object.values(weeklyUsage);

    // Days of the week starting from Sunday
    const daysOfWeek = [
      "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ];

    // Get the current weekday (e.g., "Tuesday")
    const currentDay = new Date().toLocaleString('en-US', { weekday: 'long' });

    // Calculate the index of the current day
    const currentDayIndex = daysOfWeek.indexOf(currentDay);

    // Manually reorder the weekdays to start from today, going backwards
    const sortedWeeklyTokenUsage = [...daysOfWeek.slice(currentDayIndex), ...daysOfWeek.slice(0, currentDayIndex)]
      .map(weekday => weeklyTokenUsage.find(item => item.weekday === weekday)) // Get the token usage data for each day
      .filter(Boolean); // Remove any undefined values if some weekdays have no data


    const totalTokenCost = workflows.map((item) => {
      const step0 = item?.steps[0]?.tokenUsage?.totalTokens || 0;
      const step1 = item?.steps[1]?.tokenUsage?.totalTokens || 0;
      const step2 = item?.steps[2]?.tokenUsage?.totalTokens || 0;
      const cost = Number((step0 / 1690000).toFixed(5)) + Number(((step1 + step2) / 1270000).toFixed(5));
      return cost;
    })
    

    setTokenUsage({
      totalTokenUsage: workflows.reduce((acc, workflow) => acc + workflow.totalTokenUsage.totalTokens, 0),
      totalTokenCost: totalTokenCost.reduce((acc, cost) => acc + cost, 0),
      weeklyTokenUsage:sortedWeeklyTokenUsage
    });
  }

  const fetchWorkflows = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get("/allWorkflows");
      const workflows = response.data.filter((workflow) =>
        user.role === "Admin" ? true : isSameUser(workflow.user, user._id)
      );
      setWorkflows(workflows);
      fetchTokenData(workflows);
    } catch (error) {
      console.log(error);
    }finally{
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkflows()
  }, []);

  const pageClass =
    "mx-auto flex w-full max-w-[1600px] flex-col gap-4 p-4 pb-12 sm:gap-5 sm:p-5 sm:pb-14 lg:gap-6 lg:p-6 lg:pb-16";

  return (
    <>
      {
        loading ? (
          <div className={`${pageClass} min-h-[50vh] items-center justify-center`}>
            <Loader2 size={50} className='animate-spin' />
          </div>
        ) : (
          <div className={`${pageClass} min-h-0`}>
            <div className="grid w-full min-w-0 grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
              <div className="flex min-w-0 flex-col lg:col-span-2">
                <LineChartComp
                  data={tokenUsage}
                  title="Token Usage"
                  description="Total token usage"
                  tooltipName="Tokens"
                />
              </div>

              <div className="flex min-w-0 w-full">
                <ModelsChart />
              </div>
            </div>

            <div className="grid w-full min-w-0 gap-4 lg:gap-5">
              <WorkflowUsageBar workflows={workflows} />
            </div>
          </div>
        )
      }
    </>
  )
}
