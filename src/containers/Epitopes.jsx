import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next';
import { Container, Row, Col, Card, Form, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';
import styled from 'styled-components';

import api from '../services/api.js';
import { connect } from 'react-redux';
import { MapDispatch } from '../store/index.js';

import PageHeader from '../components/PageTitle';
import Select from '../components/Select';

import colors from '../static/colors.js';

function Epitopes({ response, virus, setVirus, userToken, epitopes }) {
  const { t } = useTranslation();
  const [viruses, setViruses] = useState([]);
  const [amount, setAmount] = useState(50);
  const [onlyWithAssays, setOnlyWithAssays] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!viruses) {
      (async () => {
        setIsLoading(true);
        let data = await request('/virus/', false, false);
        if (data.status === 'success') {
          response('viruses', Object.values(data.data));
        }
        setIsLoading(false);
      })()
    }
    //eslint-disable-next-line
  }, [viruses])



  useEffect(() => {
    if (virus) {
      updateEpitopes();
    }
    //eslint-disable-next-line
  }, [virus])

  const handleVirusSelect = async e => {
    if (Number.isNaN(e)) return;
    const virus_id = Number(e);
    if (Number(virus_id) !== 0) {
      let data = await request('/virus/', virus_id);
      if (data.status === 'success') {
        console.log(data.data);
        setVirus({ ...data.data, id: virus_id });
        response('virus', { ...data.data, id: virus_id });
      }
    } else {
      eraseData();
    }
  }

  useEffect(() => {
    (async function () {
      let data = await request('/virus/', false, false);
      if (data.status === 'success') {
        setViruses(Object.values(data.data));
      }
    })()
    //eslint-disable-next-line
  }, [userToken]);

  const request = async (endpoint, virus_id = null, use_parameter = true, params = {}) => {
    let headers = { Authorization: `Bearer ${userToken}` };
    let getParams = '';
    if (Object.keys(params).length > 0) {
      getParams = `?${Object.keys(params).map(key => `${key}=${params[key]}`).join('&')}`;
    }
    if (use_parameter) {
      return (await api.get(`${endpoint}${virus_id || virus.id}${getParams}`, { headers })).data;
    }
    return (await api.get(endpoint, { headers })).data;
  }

  const updateEpitopes = async () => {
    console.log('updateEpitopes', virus);
    response('epitopes', []);
    if (!virus) return
    setIsLoading(true);
    let data = await request('/epitope/assay/top/', virus.id, true, { limit: amount, onlyWithAssays });
    if (data.status === 'success') response('epitopes', Object.values(data.data));
    setIsLoading(false);
  }

  const handleAmountChange = e => {
    e.preventDefault();
    setAmount(Number(e.target.value));
  }

  useEffect(() => {
    updateEpitopes();
    //eslint-disable-next-line
  }, [amount, onlyWithAssays]);

  const eraseData = () => {
    response('virus', null);
    response('epitopes', []);
  }

  const getIedbEpitopeUrl = epitope => {
    const base_url = 'https://iedb.org/epitope';
    if (epitope.mhc_assays.length > 0) {
      return `${base_url}/${epitope.mhc_assays[0].iedb_epitope_id}`;
    }
    if (epitope.bcell_assays.length > 0) {
      return `${base_url}/${epitope.bcell_assays[0].iedb_epitope_id}`;
    }
    if (epitope.tcell_assays.length > 0) {
      return `${base_url}/${epitope.tcell_assays[0].iedb_epitope_id}`;
    }
    return 'https://saga.bahia.fiocruz.br/vsdbmv2';
  }

  return (
    <Container className="mb-5 my-5" >
      <style type="text/css">
        {`
        .wide-tooltip .tooltip-inner {
          max-width: 50vw !important;
          text-align: left;
        }
        `}
      </style>
      <PageHeader text="VSDBM - Viral Sequence Database Manager" />
      <Row className="md-2 my-4">
        <Col md="3"></Col>
        <Col md="6" className="text-center">
          <Form.Label style={{ color: '#fff', fontWeight: 'bold' }}>{t('epitopes.select_virus')}</Form.Label>
          <Select
            id='virus-select'
            name='virus-select'
            options={viruses ? viruses.map(v => ({ label: v.name, value: v.id })) : []}
            onChange={(opt) => handleVirusSelect(opt.value)}
            value={virus ? { label: virus.name, value: virus.id } : null}
            placeholder={t('epitopes.select_virus_placeholder')}
            styles={{
              control: (base) => ({ ...base, backgroundColor: colors.color7, color: '#fff' }),
              singleValue: (base) => ({ ...base, color: '#fff' }),
              input: (base) => ({ ...base, color: '#fff' }),
              menu: (base) => ({ ...base, backgroundColor: colors.color7 })
            }}
          />
        </Col>
      </Row>
      <Row >
        <Col lg="12" xl="12" >
          <BlackCard >
            <Card.Header>
              <CardTitle>{t('epitopes.top_epitopes')}</CardTitle>
              <Form.Check
                type="checkbox"
                id="has-assays-filter"
                label={t('epitopes.only_with_assays')}
                checked={onlyWithAssays}
                disabled={isLoading}
                onChange={(e) => {
                  e.preventDefault();
                  console.log({onlyWithAssays, eventValue: e.target.checked})
                  setOnlyWithAssays(!onlyWithAssays);
                }}
                style={{ display: 'inline-block', position: 'absolute', right: '12vw', color: '#fff' }}
              />
              
              <select disabled={isLoading} className="form-control" style={{ maxWidth: '10vw', display: 'inline-block', position: 'absolute', right: '1vw', color: '#fff', backgroundColor: 'var(--color7)' }} value={amount} onChange={handleAmountChange}>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="75">75</option>
                <option value="100">100</option>
                <option value="150">150</option>
                <option value="200">200</option>
                <option value="300">300</option>
                <option value="500">500</option>
                <option value="1000">1000</option>
              </select>
            </Card.Header>
            {isLoading ? (
              <Card.Body style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spinner animation="border" role="status" variant="light" >
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </Card.Body>
            ) : (
              <Card.Body>
              <span className="d-inline-block mb-2 my-2" style={{ color: '#fff', fontWeight: 'bold' }}>
                {(virus && virus.id) ? t('epitopes.data_for', { name: virus.name }) : ''}
              </span>
              {epitopes && <Divider className="mb-2 my-2" />}
              {epitopes && epitopes.map((epitope, index) => (
                <div key={index}>

                  <Row>
                    <Col lg="12">
                      <Row>
                        <Col lg="2" style={{ color: '#fff', fontWeight: 'bold', verticalAlign: 'middle' }}>
                          <a href={getIedbEpitopeUrl(epitope)} target="_blank" rel="noopener noreferrer">{epitope.linearsequence}</a>
                        </Col>
                        <Col lg="2">
                          <span style={{ color: '#fff', fontWeight: 'bold' }}>{t('epitopes.hits', { count: epitope.count })}</span>
                        </Col>
                        <Col lg="8">
                          {epitope.bcell_assays.length > 0 &&
                            <Col lg="8">
                              <span style={{ color: '#fff', fontWeight: 'bold' }}>{t('epitopes.b_cell')}</span>
                              <ul>
                                {[...epitope.bcell_assays].map((bcell, index) =>
                                  <li style={{ color: '#fff' }} key={index}>
                                    <OverlayTrigger
                                      placement="top"
                                      overlay={<Tooltip className="wide-tooltip" id={`bcell-tooltip-${index}`}>
                                        {bcell.organism_name || ''} - {bcell.result} {(bcell.comment) ? `- ${bcell.comment}` : ''}
                                      </Tooltip>}
                                    >
                                      <p style={{
                                        display: 'inline-block',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        maxWidth: '800px',
                                        marginBottom: 0
                                      }}>
                                        {bcell.organism_name || ''} - {bcell.result} {(bcell.comment) ? `- ${bcell.comment}` : ''}
                                      </p>
                                    </OverlayTrigger>
                                  </li>
                                )}
                              </ul>
                            </Col>
                          }
                          {epitope.tcell_assays.length > 0 &&
                            <Col lg="6">
                              <span style={{ color: '#fff', fontWeight: 'bold' }}>{t('epitopes.t_cell')}</span>
                              <ul>
                                {[...epitope.tcell_assays].map((tcell, index) =>
                                  <li style={{ color: '#fff' }} key={index}>
                                    <OverlayTrigger
                                      placement="top"
                                      overlay={<Tooltip className="wide-tooltip" id={`tcell-tooltip-${index}`}>
                                        {tcell.organism_name || ''} - {tcell.result} {(tcell.comment) ? `- ${tcell.comment}` : ''}
                                      </Tooltip>}
                                    >
                                      <p style={{
                                        display: 'inline-block',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        maxWidth: '800px',
                                        marginBottom: 0
                                      }}>
                                        {tcell.organism_name || ''} - {tcell.result} {(tcell.comment) ? `- ${tcell.comment}` : ''}
                                      </p>
                                    </OverlayTrigger>
                                  </li>
                                )}
                              </ul>
                            </Col>
                          }
                          {epitope.mhc_assays.length > 0 &&
                            <Col lg="6">
                              <span style={{ color: '#fff', fontWeight: 'bold' }}>{t('epitopes.mhc')}</span>
                              <ul>
                                {[...epitope.mhc_assays].map((mhc, index) =>
                                  <li style={{ color: '#fff' }} key={index}>
                                    <OverlayTrigger
                                      placement="top"
                                      overlay={<Tooltip className="wide-tooltip" id={`mhc-tooltip-${index}`}>
                                        <b>{mhc.allele_name}</b> - {mhc.result} - {mhc.value} nM
                                      </Tooltip>}
                                    >
                                      <p style={{
                                        display: 'inline-block',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        maxWidth: '800px',
                                        marginBottom: 0
                                      }}>
                                        <b>{mhc.allele_name}</b> - {mhc.result} - {mhc.value} nM
                                      </p>
                                    </OverlayTrigger>
                                  </li>
                                )}
                              </ul>
                            </Col>
                          }
                        </Col>
                      </Row>
                    </Col>
                  </Row>

                  <Divider />
                </div>
              ))}
            </Card.Body>
          )}
          </BlackCard>
        </Col>
      </Row>
    </Container>
  )
}

const mapStateToProps = store => store;

export default connect(mapStateToProps, MapDispatch)(Epitopes)

const BlackCard = styled(Card)`
  background-color: ${colors.color7};
`;


const CardTitle = styled.h2`
  display: inline-block;
  font-size: 1.75rem;
  color: ${colors.color2};
`;

const Divider = styled.hr`
  display: block;
  height: 1px;
  border: 0;
  border-top: 1px solid #6cb8f6;
  margin: 1em 0;
  padding: 0;
`;