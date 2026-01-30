import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import { Container, Card, FormCheck } from "react-bootstrap";
import FormRange from "react-bootstrap/FormRange";
import PageHeader from "../components/PageTitle";

import styled from "styled-components";
import colors from "../static/colors.js";
import { client } from "../services/socket.js";

import processWorker from "../services/process?worker&url";
import PingSpan from "../components/PingSpan";

import { process } from "../services/work";
import { processWork, usedMemory } from "../services/utils.js";

const DEBUG_MODE = false;
const DEFAULT_WORKS_NAVIGATOR_AMOUNT = (navigator?.hardwareConcurrency ?? 8) * 4;
const DEFAULT_WORKS_AMOUNT = 4;

export default function ProcessData() {
  const { t } = useTranslation();
  const webWorkersEnabled = !!window.Worker;
  const [shouldProcess, setShouldProcess] = useState(true);
  const [worksAmount, setWorksAmount] = useState(DEFAULT_WORKS_AMOUNT);
  const [clients, setClients] = useState(0);
  const [currentWorks, setCurrentWorks] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [results, setResults] = useState([]);
  const [eta, setEta] = useState(0);
  const [processed, setProcessed] = useState(null);

  const hasProcessedSomething = useMemo(() => {
    return !!(processed?.["global-mapping"] || processed?.["local-mapping"] || processed?.["epitope-mapping"]);
  }, [processed]);

  const attributeWorks = (works) => {
    if (webWorkersEnabled) {
      setCurrentWorks(works);
      // setWorkers(Array(works.length).fill(new Worker(processWorker, { type: 'module' })));
    } else {
      // demanda na thread principal
      let start = performance.now();
      setEta(performance.now() - start);
      let localResults = [];
      works.forEach((work, index) => {
        if (DEBUG_MODE) console.log(`processing ${index + 1} of ${works.length}`, { work });
        localResults.push(process({ ...work, index }))
      });
      setResults(localResults);
      setCurrentWorks([]);
      if (DEBUG_MODE) console.log(
        new Date().toLocaleTimeString(),
        "finalizado trabalho na main thread"
      );
    }
  };
  const onPing = (data) => {
    client.emit("pong", {
      ...(data.server_ts ? { server_ts: data.server_ts } : {}),
      ...(data.server_ack_ts ? { server_ack_ts: data.server_ack_ts } : {}),
      client_ts: performance.now(),
    });
    setClients(shouldProcess ? data.clients : data.clients - 1);
    if (!results.length && !currentWorks.length) return;
    client.emit("get-work", { worksAmount });
  };

  const onConnect = () => {
    client.emit("get-work", { worksAmount });
  };

  useEffect(() => {
    if (DEBUG_MODE) console.log({ results })
    if (!results.length) return;
    setProcessed((prevState) =>
      results.reduce(
        (acc, curr) => ({ ...acc, [curr.type]: acc[curr.type] + 1 }),
        prevState
      )
    );
    client.emit("work-complete", results);
    setResults([]);
  }, [results]);

  useEffect(() => {
    if (!processed) return;
    window.localStorage.setItem("processed-data", JSON.stringify(processed));
  }, [processed]);

  useEffect(() => {
    client.connect();
    const processedLocalStorage = window.localStorage.getItem("processed-data");
    if (!processed && processedLocalStorage) {
      setProcessed(JSON.parse(processedLocalStorage));
    } else if (!processed) {
      setProcessed({
        "local-mapping": 0,
        "global-mapping": 0,
        "epitope-mapping": 0,
      });
    }
    return () => client.disconnect();
  }, []);

  useEffect(() => {
    client.on("connect", onConnect);
    client.on("ping", onPing);
    client.on("work", attributeWorks);
    return () => {
      client.off("connect", onConnect);
      client.off("ping", onPing);
      client.off("work", attributeWorks);
    };
  }, [currentWorks]);

  const executeWorks = async () => {
    let start = performance.now();
    if (DEBUG_MODE) console.log('usedMemory before', usedMemory());
    let results = [];
    for (const [index, work] of currentWorks.entries()) {
      if (DEBUG_MODE) console.log(`processing ${work.type} ${index + 1}`)
      const result = await processWork(work, index + 1);
      if (DEBUG_MODE) console.log(`finished ${work.type} ${index + 1}`)
      results.push(result);
    }
    if (DEBUG_MODE) console.log('usedMemory after', usedMemory());
    const finish = performance.now();
    if (DEBUG_MODE) console.log({ results })
    setResults(results);
    for (const worker of workers) worker.terminate();
    setWorkers([]);
    setCurrentWorks([]);
    setEta(finish - start);
  };

  useEffect(() => {
    if (!currentWorks.length) return;
    // demanda os works;
    executeWorks();
  }, [currentWorks, workers]);

  const getWorkLabel = (type) => {
    if (type === "local-mapping") return t('process_data.labels.local_mapping');
    if (type === "global-mapping") return t('process_data.labels.global_mapping');
    if (type === "epitope-mapping") return t('process_data.labels.epitope_mapping');
  };

  return (
    <Container className="mb-5 my-5">
      <PageHeader text="VSDBM - Viral Sequence Database Manager" />
      <BlackCard>
        <Card.Header className="title-box">
          <CardTitle>
            <span>{t('process_data.title')}</span>
            <FormCheck
              reverse
              type="switch"
              id="process-switch"
              label={!shouldProcess ? t('process_data.enable_process') : t('process_data.disable_process')}
              checked={shouldProcess}
              onChange={(e) => setShouldProcess(e.target.checked)}
            />
          </CardTitle>
        </Card.Header>
        <Card.Body style={{ color: "white" }}>
          <h4>{t('process_data.connection_status')}</h4>
          <ul>
            <li>{t('process_data.connected_clients', { count: clients })}</li>
            <li>
              {t('process_data.latency')} <PingSpan client={client} />
            </li>
            {shouldProcess && (
              <>
                <li>{t('process_data.works_per_time', { count: worksAmount })} </li>
                <li style={{ position: "relative" }}>
                  <FormRange
                    style={{ width: "100%" }}
                    value={worksAmount}
                    onChange={(e) => setWorksAmount(e.target.value)}
                    min={1}
                    max={(navigator?.hardwareConcurrency ?? 8) * 4}
                  />
                  <label htmlFor="range">{1}</label>
                  <label
                    htmlFor="range"
                    style={{
                      position: "absolute",
                      left: `calc(${worksAmount / DEFAULT_WORKS_NAVIGATOR_AMOUNT} * 100%)`,
                      transform: "translate(-100%)",
                    }}
                  >
                    {worksAmount}
                  </label>
                  <label htmlFor="range" style={{ float: "right" }}>
                    {DEFAULT_WORKS_NAVIGATOR_AMOUNT}
                  </label>
                </li>
                <hr />
                <li>{t('process_data.running_works', { count: currentWorks.length })}</li>
                <li>
                  {t('process_data.elapsed_time', { seconds: (eta / 1000).toFixed(3) })}
                </li>
                <hr />
                {hasProcessedSomething && (
                  <>
                    <li>{t('process_data.thank_you')}</li>
                    <li>{t('process_data.global_alignment', { count: processed?.["global-mapping"] })}</li>
                    <li>{t('process_data.subtyping', { count: processed?.["local-mapping"] })}</li>
                    <li>{t('process_data.epitope_maps', { count: processed?.["epitope-mapping"] })}</li>
                    <hr />
                  </>
                )}
                {DEBUG_MODE && currentWorks?.map((work, index) => (
                  <li key={work.identifier}>
                    {t('process_data.worker_mapping', { index: index + 1, label: getWorkLabel(work.type) })}
                  </li>
                ))}
              </>
            )}
          </ul>
        </Card.Body>
      </BlackCard>
    </Container>
  );
}

const BlackCard = styled(Card)`
  background-color: ${colors.color7};
`;

const CardTitle = styled.h2`
  color: ${colors.color2};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  > span {
    display: flex;
    flex-direction: row;
    gap: 24px;
  }
`;
