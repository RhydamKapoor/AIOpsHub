import { LineChartComp } from '@/components/charts/LineChart'
import ModelsChart from '@/components/charts/ModelsChart'
import { WorkflowUsageBar } from '@/components/charts/WorkflowUsageBar'
import React from 'react'

export default function Dashboard() {
  return (
    <div className='flex flex-col w-full p-2 gap-y-2 '>
      
      <div className="grid grid-cols-2 gap-x-4 w-full">
        <div className="flex flex-col">
          <div className="flex flex-col items-center justify-center">
            <LineChartComp
              title="Active Workflows"
              description="Total active workflows"
              value={24}
              description2="Showing total workflows for the last week"
              tooltipName="Workflows"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex flex-col items-center justify-center">
            <LineChartComp
              title="Token Usage"
              description="Total token usage"
              value={`2.1M`}
              description2="Estimated token cost $12.50"
              tooltipName="Tokens"
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-x-4 w-full">
        <div className="flex w-full col-span-2">
          <WorkflowUsageBar />
        </div>
        <div className="flex w-full">
          <ModelsChart />
        </div>
      </div>
    </div>
  )
}
