import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Form } from 'react-bootstrap';
import styled from 'styled-components';

import api from '../services/api.js';
import { connect } from 'react-redux';
import { MapDispatch } from '../store/index.js';

import PageHeader from '../components/PageTitle';
import Select from '../components/Select';

import colors from '../static/colors.js';

function Epitopes({ response, virus, setVirus, userToken, epitopes }) {
  const [viruses, setViruses] = useState([]);
  const [amount, setAmount] = useState(50);

  useEffect(() => {
    if (!viruses) {
      (async () => {
        let data = await request('/virus/', false, false);
        if (data.status === 'success') {
          response('viruses', Object.values(data.data));
        }
      })()
    }
    //eslint-disable-next-line
  }, [viruses])



  useEffect(() => {
    if (virus) {
      (async () => {
        let data = await request('/epitope/assay/top/', virus.id);
        if (data.status === 'success') {
          console.log('foi feito um novo request');
          response('epitopes', Object.values(data.data));
        }
      })()
    }
    //eslint-disable-next-line
  }, [virus])

  const handleVirusSelect = async e => {
    e.preventDefault();
    const virus_id = Number(e.target.value);
    if (Number(virus_id) !== 0) {
      let data = await request('/virus/', virus_id);
      if (data.status === 'success') {
        console.log(data.data);
        setVirus({ ...data.data, id: virus_id });
        data = await request('/epitope/assay/top/', virus_id);
        if (data.status === 'success') {
          response('epitopes', Object.values(data.data));
        }
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

  const request = async (endpoint, virus_id = null, use_parameter = true) => {
    let headers = { Authorization: `Bearer ${userToken}` };
    if (use_parameter) {
      return (await api.get(`${endpoint}${(virus_id) ? virus_id : virus.id}`, { headers })).data;
    } else {
      return (await api.get(endpoint, { headers })).data;
    }
  }

  const handleAmountChange = e => {
    e.preventDefault();
    setAmount(Number(e.target.value));
  }

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
      <PageHeader text="VSDBM - Viral Sequence Database Manager" />
      <Row className="md-2 my-4">
        <Col md="3"></Col>
        <Col md="6" className="text-center">
          <Form.Label style={{ color: '#fff', fontWeight: 'bold' }}>Select a virus:</Form.Label>
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
      <Row >
        <Col lg="12" xl="12" >
          <BlackCard >
            <Card.Header>
              <CardTitle>Top Epitopes</CardTitle>
              <select className="form-control" style={{ maxWidth: '10vw', display: 'inline-block', position: 'absolute', right: '1vw', color: '#fff', backgroundColor: 'var(--color7)' }} value={amount} onChange={handleAmountChange}>
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
            <Card.Body>
              <span className="d-inline-block mb-2 my-2" style={{ color: '#fff', fontWeight: 'bold' }}>
                {(virus && virus.id) ? `Data for ${virus.name}` : ''}
              </span>
              {epitopes && <Divider className="mb-2 my-2" />}
              {epitopes && [...epitopes].slice(0, amount).map((epitope, index) => (
                <div key={index}>

                  <Row>
                    <Col lg="12">
                      <Row>
                        <Col lg="2" style={{ color: '#fff', fontWeight: 'bold', verticalAlign: 'middle' }}>
                          <a href={getIedbEpitopeUrl(epitope)} target="_blank" rel="noopener noreferrer">{epitope.linearsequence}</a>
                        </Col>
                        <Col lg="2">
                          <span style={{ color: '#fff', fontWeight: 'bold' }}>Hits: {epitope.count}</span>
                        </Col>
                        <Col lg="8">
                          {epitope.bcell_assays.length > 0 &&
                            <Col lg="6">
                              <span style={{ color: '#fff', fontWeight: 'bold' }}>B cell</span>
                              <ul>
                                {[...epitope.bcell_assays].map((bcell, index) =>
                                  <li style={{ color: '#fff' }} key={index}>
                                    <p style={{ display: 'inline-block', cursor: 'pointer' }} title={bcell.comment}>{bcell.organism_name || ''} - {bcell.result} {(bcell.comment) ? `- ${bcell.comment.substring(0, 25)}...` : ''}</p> </li>
                                )}
                              </ul>
                            </Col>
                          }
                          {epitope.tcell_assays.length > 0 &&
                            <Col lg="6">
                              <span style={{ color: '#fff', fontWeight: 'bold' }}>T cell</span>
                              <ul>
                                {[...epitope.tcell_assays].map((tcell, index) =>
                                  <li style={{ color: '#fff' }} key={index}>
                                    <p style={{ display: 'inline-block', cursor: 'pointer' }} title={tcell.comment}>{tcell.organism_name || ''} - {tcell.result} {(tcell.comment) ? `- ${tcell.comment.substring(0, 25)}...` : ''}</p> </li>
                                )}
                              </ul>
                            </Col>
                          }
                          {epitope.mhc_assays.length > 0 &&
                            <Col lg="6">
                              <span style={{ color: '#fff', fontWeight: 'bold' }}>MHC</span>
                              <ul>
                                {[...epitope.mhc_assays].map((mhc, index) =>
                                  <li style={{ color: '#fff' }} key={index}><b>{mhc.allele_name}</b> - {mhc.result} - {mhc.value} nM</li>
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