
import {useEffect, useMemo, useState } from 'react';
import { Button } from '@mui/material';
import {
    Bars,
    Canvas,
    Cursor,
    GanttChart,
    Highlight,
    Series,
    XAxis,
    YAxis,
  } from './';
import {HighlightActions} from './HighlightActions';
import { fontFamily, fontSizes } from './internal/utils';
import {Datum} from './types'

const font = `${fontSizes.fontSize4} ${fontFamily.fontFamilySans}`;
const [DO_WHILE, FORK_JOIN_DYNAMIC, FORK] = ["DO_WHILE", "FORK_JOIN_DYNAMIC","FORK"];
const collapseTaskTypes = [DO_WHILE, FORK, FORK_JOIN_DYNAMIC];
const [COMPLETED, FAILED, IN_PROGRESS, SCHEDULED] = ["COMPLETED", "FAILED", "IN_PROGRESS", "SCHEDULED"]
const terminatedStatus = [COMPLETED, FAILED]
type ConductorTimelineProps = {
  data: any, 
  selectedTaskId: string
  setSelectedTaskId: (id:string)=>void
  OnClick: (id: string) => void;
};

export default function ConductorTimeline({data, selectedTaskId, setSelectedTaskId, OnClick }:ConductorTimelineProps){
  /** ID of tasks which have children: DO_WHILE, FORK, FORK_JOIN_DYNAMIC */
  const collapsibleTasks = useMemo<Set<string>>(() => new Set(data?.filter(task => collapseTaskTypes.includes(task.taskType)).map(task=> task.taskId)), [data]);
  /** Map from id to boolean of whether a task is expanded */ 
  const taskExpanded  = useMemo<Map<string, boolean>>(()=> new Map<string,boolean>(Array.from(collapsibleTasks).map(id => [id,false])), [data]); 
  /** Full expansion of timeline data. Simplified to contain information relevant to timeline  */
  const initialData = useMemo<Series[]>(()=>{
    let series:Series[] = [];
    let seenTaskNameToIndexMap:Map<string, number> = new Map<string,number>();
    data?.forEach(({taskId, startTime, endTime, parentTaskReferenceName, referenceTaskName, taskType, status, iteration}: any, index:number) => {
      if (!terminatedStatus.includes(status)){
        return;
      }
      let span:Datum = {
        id: taskId, //span id
        status: status,
        t1: new Date(startTime),
        t2: new Date(endTime),
        iteration,
        styles: {
          span: taskId === selectedTaskId ? {
            style: {
              fill: 'blue'
            }}: status === FAILED? {
              style: {
                fill: 'red'
              }}:{}
          }
       }
      if (!seenTaskNameToIndexMap.has(referenceTaskName)){
      series.push({
    id: taskId,
    label: `${referenceTaskName}`,
    parentTaskReferenceName,
    referenceTaskName,
    taskType,
    status,
    data: [span]
    })
    seenTaskNameToIndexMap.set(referenceTaskName, index);
      }else{
        let retryTask:Series = series[seenTaskNameToIndexMap.get(referenceTaskName)];
        retryTask.data.push(span);
        // TODO: ensure the state/status is available in data array
      }
  })
  return series;
}, [data]);
  /** Map from task ID to index in fully expanded data */
  const idToIndexMap = useMemo(()=> new Map<string, number>(initialData.map((task,idx) => [task.id, idx])), [initialData])
  /** Map from task name to task ID */
  const taskNameToIdMap = useMemo(() => new Map<string, string>(initialData.map(task=> [task.referenceTaskName, task.id])), [initialData]);
  /** Map from task reference name to task type */
  const taskTypeMap = useMemo(() => new Map<string, string>(initialData.map(task => [task.referenceTaskName, task.taskType])), [initialData]);
  /** Data for the fully collapsed view of the workflow */
  const collapsedData = useMemo<Series[]>(()=> { 
    let data:Series[] = [];
    initialData.forEach((task, idx) => {
      const {referenceTaskName:refTaskName, parentTaskReferenceName:parentTaskRefName, taskType} = task
      if (!parentTaskRefName || !collapseTaskTypes.includes(taskTypeMap.get(parentTaskRefName))){
        data.push(task);
        if (taskType === DO_WHILE){
          let i = idx+1;
          let subTaskData:Series[] = [];
          while (i<initialData.length && initialData[i].parentTaskReferenceName === refTaskName){
            let subTaskIndex = subTaskData.findIndex((tsk)=> tsk.referenceTaskName === initialData[i].referenceTaskName)
            if (subTaskIndex === -1){
              subTaskData.push(initialData[i]);
            }else{
              subTaskData[subTaskIndex] = {...subTaskData[subTaskIndex], data: [...subTaskData[subTaskIndex].data, initialData[i].data[0]]};
            }
            i++;
          }
          data.push(...subTaskData);
        }
      }
    })
    return data;
  }, [data]);
  /** ID of Tasks which exist in fully collapsed view (may or may not have subtasks) */
  const parentTaskIds = useMemo<string[]>(()=> initialData.filter((task) => {
    const {parentTaskReferenceName:parentTaskRefName} = task
    if (!parentTaskRefName || !collapseTaskTypes.includes(taskTypeMap.get(parentTaskRefName))){
      return true;
    }
    return false;
  }).map(task=>task.id)
  , [collapsedData]);
  /** Map of Task IDs to their content when collapsed */
  const collapsedTaskMap = useMemo<Map<string, Series[]>>(()=> {
    let subTaskMap = new Map<string, Series[]>();
    parentTaskIds.forEach(taskId => {
      let taskIdx = idToIndexMap.get(taskId)
      let task = initialData[taskIdx];
      subTaskMap.set(taskId, [task]);
      let i = taskIdx+1;
      let subTaskArr = subTaskMap.get(taskId);
      while (i<initialData.length && initialData[i].parentTaskReferenceName === task.referenceTaskName){        
        if (task.taskType === DO_WHILE){
          let idx = subTaskArr.findIndex((subTask)=>subTask.referenceTaskName === initialData[i].referenceTaskName);
          if (idx === -1){
            subTaskArr.push(initialData[i]);
          }else{
            subTaskArr[idx] = {...subTaskArr[idx], data: [...subTaskArr[idx].data, initialData[i].data[0]]};
          }
        }else if (task.taskType === FORK_JOIN_DYNAMIC || task.taskType === FORK){
          let newTime:Date = task.data[0].t2;
          let oldTime:Date = subTaskArr[0].data[0].t2;
          if (oldTime < newTime){
            subTaskArr[0] = {...subTaskArr[0], data: [{...subTaskArr[0].data[0], t2: newTime}]}
          }
        }
        i++;
      } 
      subTaskMap.set(taskId, subTaskArr);
    })
    return subTaskMap;
  }, [collapsedData])
  /** Map of Task IDs to their content when expanded */
  const expandedTaskMap = useMemo<Map<string, Series[]>>(()=> {
    let subTaskMap = new Map<string, Series[]>();
    parentTaskIds.forEach(taskId => {
      let taskIdx = idToIndexMap.get(taskId)
      let task = initialData[taskIdx];
      subTaskMap.set(taskId, [task]);
      let i = taskIdx+1;
      let subTaskArr = subTaskMap.get(taskId);
      while (i<initialData.length && initialData[i].parentTaskReferenceName === task.referenceTaskName){
        subTaskArr.push(initialData[i]); 
        i++;
      }    
      subTaskMap.set(taskId, subTaskArr);
    })
    return subTaskMap;
  }, [data])

  const [series, setSeries] = useState<Series[]>(collapsedData);  
  const [expanded, setExpanded] = useState<boolean>(false);
  const [max, setMax] = useState(series && series.length? series[series.length-1].data[0].t2:null);
  const [min, setMin] = useState(series && series.length? series[0].data[0].t1:null);
  
  useEffect(()=>{
    setSeries(series.map(task =>{
      task.data.forEach(span => {
        let styled = span.styles.span;
        if (span.id === selectedTaskId){
          span.styles = {span: {style: {fill: 'blue'}}};
        }else if (styled){
          span.styles = {
            span: span.status === FAILED? {
                style: {
                  fill: 'red'
                }}:{}
            };
        }
      })
      return task
    })) 
  }, [selectedTaskId])


  function toggleAll(){
    if (expanded){
      let newData = [];
      taskExpanded.forEach((value,key)=>value && taskExpanded.set(key,false));
      parentTaskIds.forEach(taskId => collapsedTaskMap.get(taskId).forEach(span => newData.push(span)));
      setSeries(newData);
    }else{
      taskExpanded.forEach((value,key)=>!value && taskExpanded.set(key,true));
      setSeries(initialData);
    }
    setExpanded(!expanded);
    
  }

  function toggleExpansion(parentTaskID:string){
    let taskIsExpanded = taskExpanded.get(parentTaskID);
    let parentTask =initialData[idToIndexMap.get(parentTaskID)];
    if (taskIsExpanded){
      let newData:Series[] = series.filter(tsk => tsk.parentTaskReferenceName !== parentTask.referenceTaskName)
      let currTaskIndex = newData.findIndex(tsk => tsk.id === parentTaskID)
      setSeries([...newData.slice(0, currTaskIndex),
        ...collapsedTaskMap.get(parentTaskID),
        ...newData.slice(currTaskIndex+1)
      ])
    }else{
      let currTaskIndex = series.findIndex(tsk => tsk.id === parentTaskID)
      setSeries([...series.slice(0, currTaskIndex),
        ...expandedTaskMap.get(parentTaskID),
        ...series.slice(currTaskIndex+1)
      ])
    }    
    taskExpanded.set(parentTaskID, !taskIsExpanded);
  }

const [barHeight, alignmentRatioAlongYBandwidth] = [22, 0.3];
return (
(<>
    <Button onClick={() =>{if (max && min){setMax(new Date(max.getTime() - (max.getTime()-min.getTime())/5));setMin(new Date(min.getTime() + (max.getTime()-min.getTime())/5))}}}>zoom in</Button>
    <Button onClick={() =>{if (max && min){setMax(new Date(max.getTime() + (max.getTime()-min.getTime())/5));setMin(new Date(min.getTime() - (max.getTime()-min.getTime())/5))}}}>zoom out</Button>
    <Button onClick={()=>{toggleAll()}}>{expanded? 'Collapse All':'Expand All'}</Button> 
    <Button onClick={() =>{if (max && min){setMax(series[series.length-1].data[0].t2);setMin(series[0].data[0].t1)}}}>zoom to fit</Button>
      <GanttChart min={min} max={max} style={{border: '3px solid transparent'}}>
          <Canvas />
          <Bars
          barHeight={barHeight}
          waitHeightDelta={2}
          alignmentRatioAlongYBandwidth={alignmentRatioAlongYBandwidth}
          onSpanClick={(datum) => {
            setSelectedTaskId(selectedTaskId===datum.id?null:datum.id);
            OnClick(datum.id);
          }}
          data={series}
          font={font}
        />
          <YAxis 
          toggleRow={toggleExpansion} 
          collapsibleRows={collapsibleTasks} 
          rows={series} 
          taskExpanded={taskExpanded} 
          selectedTaskId={selectedTaskId} 
          /> 
          <XAxis />
          <Cursor />

          <Highlight>
            <HighlightActions/>
          </Highlight>

    </GanttChart>

    </>)
    )
    
}
