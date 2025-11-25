import { useState, useEffect, useRef } from 'react'
import { Container, Card, Row, Col, Form } from 'react-bootstrap';
import styled from 'styled-components';
import colors from '../static/colors.js';

import { connect } from 'react-redux';
import { MapDispatch } from '../store/index.js';
import api from '../services/api.js';

import LineChart from '../components/Spline Chart.jsx';
import { VectorMap } from 'react-jvectormap';

import { getCode, getName } from 'country-list';

import '../static/css/map.css';
import countries from '../static/countries.js';
import Select from '../components/Select.jsx';

const DatabaseStatus = ({ userToken, virus, viruses, response }) => {
  const [virusData, setVirusData] = useState(virus || { name: '', sequences_amount: 0 });
  const [chartPoints, setChartPoints] = useState(null);
  const [woldData, setWorldData] = useState({});
  const [hoverLabel, setHoverLabel] = useState(null);
  const [coverage, setCoverage] = useState(null);
  const [translationAmount, setTranslationAmount] = useState(null);
  const [epitopesInfos, setEpitopesInfos] = useState(null);
  const [focused, setFocused] = useState('');

  const globalMapRef = useRef(null);

  // useEffect(() => {
  //   setInterval(() => {
  //     if (document.querySelector('.jvectormap-container')) {
  //       let chart = document.querySelector('.jvectormap-container').firstChild;
  //       if (Number(chart.getAttribute('height')) !== 600) {
  //         console.log('setting chart size');
  //         chart.setAttribute('height', 600);
  //       }
  //     }
  //   }, 5);
  // }, []);

  useEffect(() => {
    console.log(focused);
    Array.from(document.querySelectorAll('.jvectormap-tip')).forEach(element => element.parentNode.removeChild(element));
  }, [focused]);

  useEffect(() => {
    if (!viruses) {
      (async () => {
        let data = await request('/virus/', false, false);
        if (data.status === 'success') {
          response('viruses', Object.values(data.data));
        }
        (async () => {
          setInterval(async () => {
            console.log('updating infos');
            if (virus && virus.id !== 0) {
              if (virusData && 'id' in virusData) {
                console.log('refreshing charts');
                let data = await request('/virus/', virusData.id);
                setVirusData(data);
                response('virus', data);
              }
            }
          }, 5 * 60 * 1000);
        })()
      })()
    }
    //eslint-disable-next-line
  }, [])

  const plotGrowthGraph = async () => {
    let data = await request('/sequence/count/day/');
    let values = data.data.map(element => ({ x: new Date(element.creationdate), y: element.count }));
    let accumulator = 0;
    let pandemicAdvice = false
    const isPandemicDate = (date) => {
      if (date.getFullYear() > 2019) {
        return date.getFullYear() === 2020 && date.getMonth() === 0;
      }
      return date.getFullYear() === 2019 && date.getMonth() === 11;
    }
    values.forEach(element => {
      if (virus.refseq === 'NC_045512.2' && isPandemicDate(element.x) && !pandemicAdvice) {
        element.indexLabel = "pandemic beginning"
        element.markerColor = "red"
        element.markerType = "triangle"
        pandemicAdvice = true
      }
      element.y += accumulator;
      accumulator = element.y;
    })
    console.log({ values })
    setChartPoints(values);
  }

  const plotWorldGraph = async () => {
    let data = await request('/sequence/count/country/');
    let dto = {}
    data.data.forEach(element => {
      let code2 = getCode(element.country_name);
      if (code2) {
        dto[getCode(element.country_name)] = element.count;
      } else {
        //try to get the country code with another methods
        let our_list = countries[element.country_name.toLowerCase()];
        if (our_list) {
          dto[our_list] = element.count;
        } else {
          let last_try = getCodesExceptions(element.country_name.toLowerCase());
          if (last_try) {
            dto[last_try] = element.count;
          } else {
            console.warn(`Alpha2 code for ${element.country_name}`);
            console.warn(`Please, contact irahe22@gmail.com`);
          }
        }
      }
      setTimeout(() => {
        Array.from(document.querySelectorAll('.jvectormap-tip')).forEach(element => element.parentNode.removeChild(element));
      }, 200);
    });
    setWorldData(dto);
  }

  const getCodesExceptions = country => {
    const exceptions = {
      'iran': 'IR',
      'south korea': 'KR',
      'north korea': 'KP',
      'taiwan': 'TW',
      'republic of china': 'TW',
      'taiwan, republic of china': 'TW',
      'czech republic': 'CZ',
      'czech': 'CZ',
      'usa': 'US'
    }
    return exceptions[country];
  }

  const getCoverageData = async () => {
    let data = await request('/sequence/coverage/avg/');
    if (data.status === 'success') {
      setCoverage(Number(data.data.coverage_avg));
    }
  }
  const getFeaturesData = async () => {
    let data = await request('/sequence/translation/count/');
    if (data.status === 'success') {
      setTranslationAmount(Number(data.data.count));
    }
  }

  const getEpitopesInfos = async () => {
    const [annoted, iedb, assay] = await Promise.all([
      request('/epitope/count/', virus.id, true),
      request('/epitope/iedb/count/', virus.id, false),
      request('/epitope/iedb/assay/count/', virus.id, false),
    ]);
    console.log(annoted, iedb, assay);
    const epitope_object = { ...assay.data, iedb_count: iedb.data.count, annoted: annoted.data[0].count };
    setEpitopesInfos(epitope_object);
    console.log(epitope_object);
  }


  useEffect(() => {
    if (virus && virus.id && virus.id !== 0) {
      (async () => {
        composePage();
      })()
    }
    //eslint-disable-next-line
  }, [virusData]);

  useEffect(() => {
    if (virus && virus.id !== 0) {
      (async () => {
        composePage();
      })()
    }
    //eslint-disable-next-line
  }, [virus])

  const composePage = async () => {
    plotGrowthGraph();
    plotWorldGraph();
    getCoverageData();
    getFeaturesData();
    getEpitopesInfos();
  }


  // useEffect(() => {
  //   if (virus && virus.id !== 0) {
  //     setTimeout(async () => {
  //       console.log('refreshing charts');
  //       // plotGrowthGraph();
  //       // plotWorldGraph();
  //       let data = await request('/virus/', virusData.id);
  //       setVirusData(data);
  //       // }, 5 * 60 * 1000);
  //     }, 500);
  //   }
  //   //eslint-disable-next-line
  // }, [virusData]);

  const handleVirusSelect = async value => {
    const virus_id = Number(value);
    if (Number(virus_id) !== 0) {
      let data = await request('/virus/', virus_id);
      console.log({ data });
      if (data.status === 'success') {
        setVirusData({ ...data.data, id: virus_id });
        response('virus', { ...data.data, id: virus_id });
      }
    } else {
      eraseData();
    }
  }

  const request = async (endpoint, virus_id = null, use_parameter = true) => {
    let headers = { Authorization: `Bearer ${userToken}` };
    if (use_parameter) {
      return (await api.get(`${endpoint}${(virus_id) ? virus_id : virus.id}`, { headers })).data;
    } else {
      return (await api.get(endpoint, { headers })).data;
    }
  }

  const eraseData = () => {
    setVirusData({ name: '', sequences_amount: 0 });
    setChartPoints(null);
    setWorldData({});
    setHoverLabel(null);
    setCoverage(null);
    setTranslationAmount(null);
    setEpitopesInfos(null);
    response('virus', null);
  }

  return (

    <div className="my3 my-md-5">
      <Container >
        <BlackCard >
          <Card.Body className="p-2 text-center">
            <CardTitle style={{ marginBottom: "0.10em", color: '#fff' }}>{virusData.sequences_amount ? virusData.sequences_amount : ''}</CardTitle>
            <div style={{ paddingTop: '10px', fontSize: '14px', color: '#fff' }}>{virusData.name}</div>
            <div style={{ paddingTop: '5px', fontSize: '14px', color: '#fff' }}>{virusData.refseq && <a href={`https://www.ncbi.nlm.nih.gov/nuccore/${virusData.refseq}`} target="_blank" rel="noopener noreferrer" style={{ cursor: 'poninter', textDecoration: 'none' }}>{virusData.refseq}</a>}</div>
            <div style={{ paddingTop: '5px', fontSize: '14px', color: '#fff' }}>{(coverage) ? `The sequences have an average of ${parseFloat(coverage).toFixed(2)}% coverage in the reference sequence` : ''}</div>
            <div style={{ paddingTop: '5px', fontSize: '14px', color: '#fff' }}>{(translationAmount) ? `At this moment we have a total of ${translationAmount} sequence features/translations` : ''}</div>
            <div style={{ paddingTop: '15px', fontSize: '14px', color: '#fff' }}>{(epitopesInfos) ? `We have annoted ${epitopesInfos.annoted} epitopes, but we have also ${epitopesInfos.iedb_count} epitopes which becames from IEDB which gaves us this informations about our epitope annotations:` : ''}</div>
            {
              (epitopesInfos) ?
                <ul style={{ listStyle: 'none' }}>
                  <li style={{ fontSize: '14px', color: '#fff' }}><b>{epitopesInfos.bcell_count}</b> epitopes had studies for B cell</li>
                  <li style={{ fontSize: '14px', color: '#fff' }}><b>{epitopesInfos.tcell_count}</b> epitopes had studies for T cell</li>
                  <li style={{ fontSize: '14px', color: '#fff' }}><b>{epitopesInfos.mhc_bind_count}</b> epitopes had studies for MHC</li>
                </ul>
                : ''
            }
          </Card.Body>
        </BlackCard>
        <Row className="my-md-1">
          <Col md="3"></Col>
          <Col md="6" className="text-center">
            <Form.Label style={{ color: '#fff', fontWeight: 'bold' }} htmlFor='virus-select'>Select a virus:</Form.Label>
            <Select
              id='virus-select'
              name='virus-select'
              options={viruses ? viruses.map(v => ({ label: v.name, value: v.id })) : []}
              onChange={(opt) => handleVirusSelect(opt.value)}
              value={virus ? { label: virus.name, value: virus.id } : null}
              placeholder="Select a virus..."
              styles={{
                control: (base) => ({ ...base, backgroundColor: colors.color7, color: '#fff' }),
                singleValue: (base) => ({ ...base, color: '#fff' }),
                input: (base) => ({ ...base, color: '#fff' }),
                menu: (base) => ({ ...base, backgroundColor: colors.color7 })
              }}
            />
          </Col>
        </Row>
        <Row className="row-cards">
          <Col lg="12" xl="12" className="my-md-3">
            <BlackCard >
              <Card.Header>
                <span style={{ fontSize: '22px', fontWeight: "bold" }}>Database Growth</span>
              </Card.Header>
              <Card.Body>
                <LineChart name={virusData.name} infos={chartPoints} />
              </Card.Body>
            </BlackCard>
          </Col>
          <Col lg="12" md="12" className="my-md-3">
            <BlackCard>
              <Card.Header>
                <span style={{ fontSize: '22px', fontWeight: "bold" }}>Sequence Submission</span>
              </Card.Header>
              <Card.Body>
                <span
                  className={`badge badge-${hoverLabel?.includes(': 0') ? 'danger' : 'primary'}`}
                  style={{ position: 'relative', display: 'inline-block', fontWeight: 'bold', fontSize: '16px', color: colors.color0 }}
                >{hoverLabel ?? 'Select a country'}</span>
                {(Object.keys(woldData).length > 0) ?
                  <div style={{ width: 1068, height: 700 }}>
                    <VectorMap
                      map={"world_mill"}
                      ref={(map) => {
                        if (globalMapRef.current) {
                          globalMapRef.current.tip.remove();
                        }
                        if (map) {
                          globalMapRef.current = map.$mapObject
                        }
                      }}
                      containerClassName="map"
                      backgroundColor={colors.color7} //change it to ocean blue: #0077be
                      zoomOnScroll={true}
                      containerStyle={{
                        width: '100%',
                        height: '100%'
                      }}
                      zoomButtons={true}
                      onRegionOver={
                        function (evt, country) {
                          const message = `${getName(country)}: ${woldData?.[country] ?? 0}`;
                          // console.log({evt, country})
                          setHoverLabel(message);
                          evt.preventDefault();
                        }
                      }
                      onRegionTipShow={(event, element, country) => {
                        const message = `${getName(country)}: ${woldData?.[country] ?? 0}`;
                        element.html(message);
                      }}
                      onRegionClick={
                        function (evt, fn, country) {
                          evt.preventDefault();
                          setFocused(fn)
                          const message = `${getName(country)}: ${woldData?.[country] ?? 0}`;
                          setHoverLabel(message);
                          // Array.from(document.querySelectorAll('.jvectormap-tip')).forEach(element => element.parentNode.removeChild(element));
                        }
                      }
                      setFocus={{
                        region: focused || '',
                        scale: 25,
                        animate: true
                      }}
                      regionStyle={{
                        position: 'relative',
                        initial: {
                          fill: "#e4e4e4",
                          "fill-opacity": 0.9,
                          stroke: "none",
                          "stroke-width": 0,
                          "stroke-opacity": 0,
                        },
                        hover: {
                          "fill-opacity": 0.8,
                          cursor: "pointer"
                        },
                        selected: {
                          fill: "#2938bc" //color for the clicked country
                        },
                        selectedHover: {}
                      }}
                      regionsSelectable={true}
                      series={{
                        regions: [
                          {
                            values: woldData, //this is your data
                            scale: Array.from(Object.values(colors)).splice(0, 5), //your color game's here
                            normalizeFunction: "polynomial"
                          }
                        ]
                      }}
                    />
                  </div>
                  :
                  <p>Select an organism</p>
                }
              </Card.Body>
            </BlackCard>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

const mapStateToProps = store => store;

export default connect(mapStateToProps, MapDispatch)(DatabaseStatus)


const BlackCard = styled(Card)`
  background-color: ${colors.color7};
`;


const CardTitle = styled.h2`
  color: ${colors.color2};
  font-size: 3rem;
`;