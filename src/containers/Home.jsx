import React from 'react'
import { useTranslation, Trans } from 'react-i18next';
import { Container, Card, Col, Row, CardGroup } from 'react-bootstrap';
import PageHeader from '../components/PageTitle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestion } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';

export default function Home() {
  const { t } = useTranslation();
  return (
    <NewContainer style={{ position: 'relative' }}>
      <PageHeader text={t('home.title')} />
      <Col lg="12">
        <Row>
          <CardGroup>
            <NewCard aside>
              <Card.Body>
                <h4>
                  <NewCardTitle className="title-box" style={{ color: '#99A0AB' }}>
                    {t('home.what_is_title')} <FontAwesomeIcon icon={faQuestion} />
                  </NewCardTitle>
                </h4>
                <NewCardBody>
                  {t('home.what_is_text_1')}
                  <ul>
                    <li>{t('home.what_is_list.backend')}</li>
                    <li>{t('home.what_is_list.database')}</li>
                    <li>{t('home.what_is_list.frontend')}</li>
                  </ul>
                    {t('home.what_is_text_2')}
                </NewCardBody>
              </Card.Body>
            </NewCard>
            <NewCard aside>
              <Card.Body>
                <h4>
                  <NewCardTitle className="title-box" style={{ color: '#99A0AB' }}>
                    {t('home.who_made_title')} <FontAwesomeIcon icon={faQuestion} />
                  </NewCardTitle>
                </h4>
                <NewCardBody>
                  {t('home.who_made_text')}
                  <ul>
                    <li>{t('home.who_made_list.dev_1')}</li>
                    <li>{t('home.who_made_list.dev_2')}</li>
                    <li>{t('home.who_made_list.advisor')}</li>
                  </ul>
                </NewCardBody>
              </Card.Body>
            </NewCard>
          </CardGroup>
        </Row>
      </Col>
      <Col lg="12" style={{ marginTop: '20px' }}>
        <Row>
          <CardGroup>
            <NewCard aside>
              <Card.Body>
                <h4>
                  <NewCardTitle className="title-box" style={{ color: '#99A0AB' }}>
                    {t('home.how_contribute_title')} <FontAwesomeIcon icon={faQuestion} />
                  </NewCardTitle>
                </h4>
                <NewCardBody>
                  {t('home.how_contribute_text')} <a href="mailto:heltonfabio@outlook.com">heltonfabio@outlook.com</a>
                </NewCardBody>
              </Card.Body>
            </NewCard>
            <NewCard aside>
              <Card.Body>
                <h4>
                  <NewCardTitle className="title-box" style={{ color: '#99A0AB' }}>
                    {t('home.who_maintain_title')} <FontAwesomeIcon icon={faQuestion} />
                  </NewCardTitle>
                </h4>
                <NewCardBody>
                  {t('home.who_maintain_text')}
                </NewCardBody>
              </Card.Body>
            </NewCard>
          </CardGroup>
        </Row>
      </Col>
    </NewContainer>
  )
}

const NewContainer = styled(Container)`
  @media (min-width: 1280px){
    max-width: 1200px;
  }
`;

const NewCard = styled(Card)`
  background-color: var(--color7);
  margin-bottom: 1.5rem;
`;

const NewCardTitle = styled(Card.Title)`
&:hover {
  text-shadow: 0px 0px 5px black;
}
`;

const NewCardBody = styled(Card.Text)`
padding-top: 10px;
border-top: 1px dotted grey;
color: #9aa0ac !important;
text-align: justify;
`;

const Title = styled.a`

`;