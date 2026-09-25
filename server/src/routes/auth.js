import express from 'express';
import crypto from 'crypto';

const router = express.Router();

// O hash é lido no login, após o carregamento do .env pelo servidor.



/**
 * POST /api/auth/login
 * Autentica o admin e retorna token
 */
router.post('/login', (req, res) => {
  try {
    const { password } = req.body;
    const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
    if (!ADMIN_PASSWORD_HASH) {
      return res.status(503).json({ success: false, message: 'Login não configurado' });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Senha é obrigatória'
      });
    }

    // Gera hash SHA1 da senha fornecida
    const hashedPassword = crypto
      .createHash('sha1')
      .update(password)
      .digest('hex');

    console.log('🔐 Tentativa de login:');
    console.log('   Hash gerado:', hashedPassword);
    console.log('   Hash esperado:', ADMIN_PASSWORD_HASH);
    console.log('   Match:', hashedPassword === ADMIN_PASSWORD_HASH);

    // Verifica se a senha está correta
    if (hashedPassword !== ADMIN_PASSWORD_HASH) {
      return res.status(401).json({
        success: false,
        message: 'Senha incorreta'
      });
    }

    // Cria token simples (válido por 24 horas)
    const token = {
      authenticated: true,
      expires: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
      timestamp: Date.now()
    };

    // Criptografa o token (base64 simples)
    const tokenString = Buffer.from(JSON.stringify(token)).toString('base64');

    console.log('✅ Login realizado com sucesso!');

    return res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token: tokenString,
      expiresIn: 24 * 60 * 60 * 1000 // 24 horas em ms
    });

  } catch (error) {
    console.error('❌ Erro no login:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao processar login'
    });
  }
});

/**
 * POST /api/auth/verify
 * Verifica se o token ainda é válido
 */
router.post('/verify', (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token é obrigatório'
      });
    }

    // Descriptografa o token
    const tokenData = JSON.parse(
      Buffer.from(token, 'base64').toString('utf-8')
    );

    // Verifica se o token não expirou
    const now = Date.now();
    const isValid = tokenData.expires > now;

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    return res.json({
      success: true,
      message: 'Token válido',
      expiresIn: tokenData.expires - now
    });

  } catch (error) {
    console.error('❌ Erro ao verificar token:', error);
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
});

/**
 * POST /api/auth/logout
 * Invalida o token (na prática, só confirma o logout)
 */
router.post('/logout', (req, res) => {
  return res.json({
    success: true,
    message: 'Logout realizado com sucesso'
  });
});

export default router;
