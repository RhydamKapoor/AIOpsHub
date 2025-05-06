import { LineChartComp } from '@/components/charts/LineChart'
import ModelsChart from '@/components/charts/ModelsChart'
import { WorkflowUsageBar } from '@/components/charts/WorkflowUsageBar'
import { useAuth } from '@/context/AuthContext'
import axiosInstance from '@/utils/axiosConfig'
import { Loader2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'

export default function Dashboard() {
  const {user} = useAuth()  
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
      const workflows = response.data.filter(workflow => user.role === "Admin" ? true : workflow.user === user._id);
      setWorkflows(workflows);

      const getTokenData =  fetchTokenData(workflows);
      console.log(workflows);
      
      console.log(getTokenData);
      
    } catch (error) {
      console.log(error);
    }finally{
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkflows()
  }, []);
  return (
    <>
      {
        loading ? (
          <div className='flex flex-col items-center justify-center h-full w-full p-2 gap-y-2 '>
            <Loader2 size={50} className='animate-spin' />
          </div>
        ) : (
          
          <div className='flex flex-col w-full p-2 gap-y-2 h-full'>
            
            <div className="grid grid-cols-3 gap-x-4 w-full">

              <div className="flex flex-col col-span-2">
                <div className="flex flex-col items-center justify-center">
                  <LineChartComp
                    data={tokenUsage}
                    title="Token Usage"
                    description="Total token usage"
                    value={`2.1M`}
                    description2=" $12.50"
                    tooltipName="Tokens"
                  />
                </div>
              </div>
              
              <div className="flex w-full">
                <ModelsChart />
              </div>
            </div>
            <div className="grid gap-x-4 w-full h-full">

              <div className="flex w-full h-full col-span-2">
                <WorkflowUsageBar workflows={workflows}/>
              </div>
            </div>
          </div>
        )
      }
    </>
  )
}
