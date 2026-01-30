import React from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Card } from 'react-bootstrap';
import PageHeader from '../components/PageTitle';

import styled from 'styled-components';
import colors from '../static/colors.js';

export default function SequenceSubtyping() {
  const { t } = useTranslation();
  return (
    <Container className="mb-5 my-5">
      <PageHeader text="VSDBM - Viral Sequence Database Manager" />
      <BlackCard>
        <Card.Header>
          <CardTitle>{t('sequence_subtyping.title')}</CardTitle>
        </Card.Header>
        <Card.Body>
          {t('sequence_subtyping.info')}
        </Card.Body>
      </BlackCard>
    </Container>
  )
}


const BlackCard = styled(Card)`
  background-color: ${colors.color7};
`;

const CardTitle = styled.h2`
  color: ${colors.color2};
`;