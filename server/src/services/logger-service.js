/**
 * Logger Service - Serviço centralizado de logs
 * Registra: Requisições HTTP, erros, e eventos do sistema
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Diretórios de logs
const logsDir = path.join(__dirname, '../../logs');
const apiLogsFile = path.join(logsDir, 'api-requests.log');
const errorLogsFile = path.join(logsDir, 'errors.log');
const cronLogsFile = path.join(logsDir, 'cron-executions.log');

// Criar diretório de logs se não existir
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Formata a data/hora no padrão brasileiro
 */
function formatDateTime() {
  return new Date().toLocaleString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

/**
 * Log de requisições HTTP
 */
export function logApiRequest(req, res, duration, cacheHit = false) {
  const logEntry = {
    timestamp: formatDateTime(),
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    duration: `${duration.toFixed(2)}ms`,
    cacheHit: cacheHit ? 'SIM' : 'NÃO',
    userAgent: req.get('user-agent')?.substring(0, 50) || 'N/A',
    ip: req.ip || req.connection.remoteAddress
  };

  const logLine = `[${logEntry.timestamp}] ${logEntry.method.padEnd(6)} ${logEntry.statusCode} ${logEntry.duration.padStart(8)} | ${logEntry.cacheHit.padStart(3)} | ${logEntry.url}\n`;

  fs.appendFile(apiLogsFile, logLine, (err) => {
    if (err) console.error('Erro ao escrever log de API:', err);
  });
}

/**
 * Log de erros
 */
export function logError(error, context = '') {
  const logEntry = {
    timestamp: formatDateTime(),
    context,
    message: error.message,
    stack: error.stack,
    code: error.code
  };

  const logLine = `
════════════════════════════════════════════════════════════
[${logEntry.timestamp}] ❌ ERRO
Contexto: ${context}
Mensagem: ${error.message}
Código: ${error.code || 'N/A'}
Stack:
${error.stack}
════════════════════════════════════════════════════════════

`;

  fs.appendFile(errorLogsFile, logLine, (err) => {
    if (err) console.error('Erro ao escrever log de erro:', err);
  });
}

/**
 * Log de execução de cron job
 */
export function logCronExecution(status, details = {}) {
  const timestamp = formatDateTime();
  
  const logEntry = {
    timestamp,
    status,
    ...details
  };

  const logLine = `
════════════════════════════════════════════════════════════
[${timestamp}] 🔄 CRON JOB
Status: ${status}
Detalhes:
${Object.entries(details)
  .map(([key, value]) => `  ${key}: ${value}`)
  .join('\n')}
════════════════════════════════════════════════════════════

`;

  fs.appendFile(cronLogsFile, logLine, (err) => {
    if (err) console.error('Erro ao escrever log de cron:', err);
  });
}

/**
 * Log genérico no console e arquivo
 */
export function logInfo(message, level = 'INFO') {
  const timestamp = formatDateTime();
  console.log(`[${timestamp}] ${level}: ${message}`);
}

/**
 * Obter últimas linhas de um arquivo de log
 */
export function getLogTail(filename, lines = 50) {
  const filePath = path.join(logsDir, `${filename}.log`);
  
  try {
    if (!fs.existsSync(filePath)) {
      return `Arquivo de log não encontrado: ${filename}`;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const allLines = content.split('\n');
    const tail = allLines.slice(-lines).join('\n');
    
    return tail;
  } catch (error) {
    return `Erro ao ler log: ${error.message}`;
  }
}

/**
 * Limpar arquivo de log
 */
export function clearLog(filename) {
  const filePath = path.join(logsDir, `${filename}.log`);
  
  try {
    fs.writeFileSync(filePath, '', 'utf-8');
    return `Log ${filename} limpo com sucesso`;
  } catch (error) {
    return `Erro ao limpar log: ${error.message}`;
  }
}

/**
 * Obter estatísticas dos logs
 */
export function getLogStats() {
  const stats = {};

  [apiLogsFile, errorLogsFile, cronLogsFile].forEach((filePath) => {
    const filename = path.basename(filePath).replace('.log', '');
    
    try {
      if (fs.existsSync(filePath)) {
        const size = fs.statSync(filePath).size;
        const lines = fs.readFileSync(filePath, 'utf-8').split('\n').length;
        stats[filename] = {
          arquivo: path.basename(filePath),
          tamanho: `${(size / 1024).toFixed(2)} KB`,
          linhas: lines,
          caminho: filePath
        };
      } else {
        stats[filename] = {
          arquivo: path.basename(filePath),
          tamanho: '0 KB',
          linhas: 0,
          status: 'não criado ainda'
        };
      }
    } catch (error) {
      stats[filename] = { erro: error.message };
    }
  });

  return stats;
}

/**
 * Middleware Express para logging de requisições
 */
export function requestLoggingMiddleware() {
  return (req, res, next) => {
    const startTime = Date.now();

    // Interceptar o método res.send original
    const originalSend = res.send;
    res.send = function(data) {
      const duration = Date.now() - startTime;
      logApiRequest(req, res, duration);
      return originalSend.call(this, data);
    };

    next();
  };
}

export default {
  logApiRequest,
  logError,
  logCronExecution,
  logInfo,
  getLogTail,
  clearLog,
  getLogStats,
  requestLoggingMiddleware
};
