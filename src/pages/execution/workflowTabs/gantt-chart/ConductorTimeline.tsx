
import {useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import {
    Bars,
    Canvas,
    Cursor,
    GanttChart,
    Highlight,
    Series,
    XAxis,
    YAxis,
  } from '.';
import {HighlightActions} from './HighlightActions';
import { fontFamily, fontSize } from '@mui/system';

// const now = new Date();
// const hourLater = new Date(now.getTime() + 60 * 1000);
const font = `${fontSizes.fontSize4} ${fontFamily.fontFamilySans}`;
const collapseTaskTypes = ["FORK_JOIN_DYNAMIC", "DO_WHILE", "FORK"];

type ConductorTimelineProps = {
  data: any, 
  selectedTaskId: string
  setSelectedTaskId: (id:string)=>void
};


export default function ConductorTimeline({data, selectedTaskId, setSelectedTaskId }:ConductorTimelineProps){
  const [collapseTasks, setCollapseTasks] = useState(new Set<string>()); //id of tasks which can disappear REMOVE subtasks
  const [subTaskIdMap, setSubTaskIdMap] = useState(new Map<string, string[]>());//id to list of ids of tasks which can disappear
  const [taskTypeMap, setTaskTypeMap] = useState(new Map<string, string>());//id -> task type
  const [collapseLengths, setCollapseLengths] = useState(new Map<string, Date>());
  const [refTaskNameToID, setRefTaskNameToID] = useState(new Map<string, string>()); //refer... to id
  const [indexMap, setIndexMap] = useState(new Map<string, number>());
  const [taskExpanded, setTaskExpanded]  = useState(new Map<string, boolean>()); //id -> whether task is expanded
  
  const [initialData, setInitialData] = useState<Series[]>(data.map(({taskId, startTime, endTime, parentTaskReferenceName, referenceTaskName, taskType, status}: any) => ({
    id: taskId,
    label: `${referenceTaskName}`,
    parentTaskReferenceName,
    referenceTaskName,
    taskType,
    status,
    data: [{
        id: taskId,
        t1: new Date(startTime),
        t2: new Date(endTime),
        styles: {
          span: taskId === selectedTaskId ? {
            style: {
              fill: 'blue'
            }}: {}
          }
       }]
    })));
  const [collapsedData, setCollapsedData] = useState<Series[]>();

  
  useEffect(()=>{
    initialData.map((task, index) => {
      const {id, data, parentTaskReferenceName, taskType, referenceTaskName} = task;
      let parentRefName = parentTaskReferenceName;
      let parentID = refTaskNameToID.get(parentRefName)!;
      setIndexMap(indexMap.set(id,index));
      setTaskExpanded(taskExpanded.set(id, true));
      setTaskTypeMap(taskTypeMap.set(id, taskType));
      setRefTaskNameToID(refTaskNameToID.set(referenceTaskName, id));
      if(parentRefName && collapseTaskTypes.includes(taskTypeMap.get(parentID)!)){
        setCollapseTasks(collapseTasks.add(parentID));
        if (!subTaskIdMap.has(parentID)){
          setSubTaskIdMap(subTaskIdMap.set(parentID, []));
        }
        let childTasksArr = subTaskIdMap.get(parentID)
        childTasksArr!.push(id);
        setSubTaskIdMap(subTaskIdMap.set(parentID, childTasksArr!));
  
      } 
      let oldTime = collapseLengths.get(parentRefName) || new Date(0);
      let newTime = data[0].t2;
      if (parentRefName && oldTime<newTime){
        setCollapseLengths(collapseLengths.set(parentRefName, newTime));
      }
      
    });    

    setCollapsedData(initialData.filter(({parentTaskReferenceName})=>{
      let parentRefName = parentTaskReferenceName;
      if (!parentRefName){
        return true;
      }
      let parentID = refTaskNameToID.get(parentRefName)!;
      return !collapseTaskTypes.includes(taskTypeMap.get(parentID)!);
      // kids removed
    }).map((task) =>{ 
      // parents
      let parentID = task.id;
      if (!collapseTaskTypes.includes(taskTypeMap.get(parentID)!)){return task;}
  
      let oldTime = task.data[0].t2
      let newTime = collapseLengths.get(task.referenceTaskName);
      if (newTime && newTime>oldTime){
        return {...task, data: [{...task.data[0], t2:newTime}]}
      }
      return task;
      
    }))
  }, [])
  
  useEffect(()=>{
    setSeries(series.map(task =>{
      let styled = task.data[0].styles!.span;
      if (task.id === selectedTaskId){
        task.data[0].styles = {span: {style: {fill: 'blue'}}};
      }else if (styled){
        task.data[0].styles = {span: {}};
      }
      return task
      
    })) 
  }, [selectedTaskId])
  
  function toggleAll(){
    if (expanded){
      taskExpanded.forEach((value,key)=>value?setTaskExpanded(taskExpanded.set(key,false)):null);
      setSeries(collapsedData!);
    }else{
      taskExpanded.forEach((value,key)=>!value?setTaskExpanded(taskExpanded.set(key,true)):null);
      setSeries(initialData);
    }
    setExpanded(!expanded);
  }


  function toggleExpansion(parentTaskID:string){
    let taskIsExpanded = taskExpanded.get(parentTaskID);
    if (taskIsExpanded){ 
      const newData = series.filter((task)=>{
        const {parentTaskReferenceName} = task;
        if (!parentTaskReferenceName){return true;}
        return refTaskNameToID.get(parentTaskReferenceName) !== parentTaskID;

      }).map((task)=>{
        const {id,referenceTaskName, data} = task;
        if (id === parentTaskID){
          let newTime = collapseLengths.get(referenceTaskName);
          if (newTime && newTime>data[0].t2){
            return {...task, data: [{...task.data[0], t2:newTime}]} 
          }
        }
        return task;
      })
      setSeries(newData);
    }else{
      const subTasks:Series[] = subTaskIdMap.get(parentTaskID)!.map(id => initialData.at(indexMap.get(id)!)!);
      let index = indexMap.get(parentTaskID)!
      const newData:Series[] = [...series.slice(0, index),
                      initialData.at(indexMap.get(parentTaskID)!)!,
                      ...subTasks,
                       ...series.slice(index+1)];
      setSeries(newData);
    }
    setTaskExpanded(taskExpanded.set(parentTaskID, !taskIsExpanded));
  }
  const [series, setSeries] = useState<Series[]>(initialData);
  const [expanded, setExpanded] = useState<boolean>(true);
  const [max, setMax] = useState(initialData.slice(-1)[0].data[0].t2);
  const [min, setMin] = useState(initialData[0].data[0].t1);
  const preciseFormat = "hh:mm:ss:SSS";
    return <>
    <Button onClick={() =>{setMax(new Date(max.getTime() - (max.getTime()-min.getTime())/5));setMin(new Date(min.getTime() + (max.getTime()-min.getTime())/5))}}>zoom in</Button>
    <Button onClick={() =>{setMax(new Date(max.getTime() + (max.getTime()-min.getTime())/5));setMin(new Date(min.getTime() - (max.getTime()-min.getTime())/5))}}>zoom out</Button>
    <Button onClick={()=>{toggleAll()}}>{expanded? 'Collapse All':'Expand All'}</Button> 
      <GanttChart min={min} max={max}>

          <Canvas />
    
          <Bars
          barHeight={22}
          waitHeightDelta={2}
          alignmentRatioAlongYBandwidth={0.3}
          onSpanClick={(_, series) => {
            setSelectedTaskId(selectedTaskId==series.id?"":series.id);  
          }}
          data={series}
          font={font}
        />

          <YAxis toggleRow={toggleExpansion} collapsibleRows={collapseTasks} rows={series} taskExpanded={taskExpanded} selectedTaskId={selectedTaskId} /> 

          <XAxis dateFormat={max.getTime()-min.getTime()<10*1000? preciseFormat:undefined} /> 

          <Cursor />

          <Highlight>
            <HighlightActions/>
          </Highlight>

    </GanttChart>

    </>
}
