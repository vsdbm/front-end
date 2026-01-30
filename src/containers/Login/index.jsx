import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';

import Logo from '../../static/img/logo.svg';

import { InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faKey } from '@fortawesome/free-solid-svg-icons';
import {CardBody, CardHeader, CheckBox, Container, ForgotPassword, LoginBtn, LoginCard, LogoWrapper, NewInput, Remember} from './styles.jsx';


import { useDispatch, useSelector } from 'react-redux';
import { response, login } from '../../store/actions.js';

export const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch()

  const userToken = useSelector((store) => store.userToken);
  const userData = useSelector(store => store.userData);
  const logado = useSelector(store => store.logado);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [disabled, setDisabled] = useState(!email);
  const [stayLogged, setStayLogged] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    //verificando se ta logado
    let token = window.localStorage.getItem("token");
    let user = window.localStorage.getItem("userData");
    if (token && user) return loginAndRedirect(JSON.parse(token), JSON.parse(user));
    if (userToken && userData && logado) return loginAndRedirect(userToken, userData);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDigitEmail = e => {
    e.preventDefault();
    let inserting = e.target.value.toLowerCase();
    setEmail(inserting);
    if (error.length > 0) {
      setError('');
    }
  }
  useEffect(() => {
    setDisabled(
      !email || !email.match(/^[\w.-]+@[\w-]+\.[a-z]{2,}(\.[a-z]{2,})?$/)
    );
    //response('disabledNext', !email || !email.match(/^[\w.]+@[\w]+\.[a-z]{2,}(\.[a-z]{2,})?$/))
  }, [email]);

  const handleDigitPassword = e => {
    e.preventDefault();
    setPassword(e.target.value);
    if (error.length > 0) {
      setError('');
    }
  }

  const handleStayLogged = e => setStayLogged(!stayLogged);

  const handleLogin = async e => {
    e.preventDefault();
    try {
      if (email.trim() === '' || password.trim() === '') {
        setError(t('login.error_empty'));
        return;
      }
      let data = await api.post('/login/', { email, password });
      if (data.data.status === 'success') {
        if (stayLogged) {
          window.localStorage.setItem("userData", JSON.stringify(data.data.data.user));
          window.localStorage.setItem("token", JSON.stringify(data.data.data.token));
        }
        loginAndRedirect(data.data.data.token, data.data.data.user);
      } else {
        setError(t('login.error_verify'));
        setPassword('');
      }
    } catch (error) {
      setError(t('login.error_generic') + ' ' + error.message)
    }
  }

  const loginAndRedirect = (token, userData) => {
    dispatch(login(token, userData));
    dispatch(response('logado', true));
    navigate('/home');
  }

  const forgot = e => {
    alert(t('login.forgot_alert'));
  }
  return (
    <Container>
      <LoginCard>
        <CardHeader className="mb-5">
          <LogoWrapper>
            <img src={Logo} alt="logo" width="120" height="120" />
          </LogoWrapper>
        </CardHeader>
        {error && <span style={{ display: 'inline-block', color: 'red', position: 'absolute', top: '25%', left: '25%' }}>{error}</span>}
        <CardBody>
          <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon1"><FontAwesomeIcon icon={faUser}></FontAwesomeIcon></InputGroup.Text>
            <NewInput
              placeholder={t('login.email_placeholder')}
              aria-label="Email"
              aria-describedby="email"
              onChange={handleDigitEmail}
              value={email || ''}
            />
          </InputGroup>
          <InputGroup className="mb-4">
            <InputGroup.Text id="basic-addon1"><FontAwesomeIcon icon={faKey}></FontAwesomeIcon></InputGroup.Text>
            <NewInput type="password"
              placeholder={t('login.password_placeholder')}
              aria-label="password"
              aria-describedby="password"
              onChange={handleDigitPassword}
              value={password || ''}
            />
          </InputGroup>
          <Remember className="mb-2">
            <CheckBox type="checkbox" defaultChecked={stayLogged} onChange={handleStayLogged} />
            <span>{t('login.remember_me')}</span>
          </Remember>
          <LoginBtn className="btn mb-3" as="input" type="submit" value={t('login.login_button')} onClick={handleLogin} disabled={disabled} />{' '}
        </CardBody>
        <ForgotPassword className="d-flex justify-content-center" onClick={forgot}>
          <span>{t('login.forgot_password')}</span>
        </ForgotPassword>
      </LoginCard>
    </Container>
  )
}

export default Login;