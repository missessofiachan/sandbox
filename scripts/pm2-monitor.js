#!/usr/bin/env node

/**
 * PM2 Monitoring and Management Script
 * Provides additional monitoring capabilities for the Sandbox API
 */

const pm2 = require('pm2');
const fs = require('fs');
const path = require('path');

class PM2Monitor {
  constructor() {
    this.logFile = path.join(__dirname, '..', 'logs', 'pm2-monitor.log');
    this.metricsFile = path.join(__dirname, '..', 'logs', 'pm2-metrics.json');
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;

    console.log(logEntry.trim());

    // Append to log file
    fs.appendFileSync(this.logFile, logEntry);
  }

  async connect() {
    return new Promise((resolve, reject) => {
      pm2.connect((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async disconnect() {
    return new Promise((resolve) => {
      pm2.disconnect(() => {
        resolve();
      });
    });
  }

  async getProcessList() {
    return new Promise((resolve, reject) => {
      pm2.list((err, processes) => {
        if (err) {
          reject(err);
        } else {
          resolve(processes);
        }
      });
    });
  }

  async collectMetrics() {
    try {
      await this.connect();
      const processes = await this.getProcessList();

      const metrics = {
        timestamp: new Date().toISOString(),
        processes: processes.map((proc) => ({
          name: proc.name,
          pid: proc.pid,
          status: proc.pm2_env.status,
          restarts: proc.pm2_env.restart_time,
          uptime: proc.pm2_env.pm_uptime
            ? Date.now() - proc.pm2_env.pm_uptime
            : 0,
          cpu: proc.monit.cpu,
          memory: proc.monit.memory,
          user: proc.pm2_env.username,
          watching: proc.pm2_env.watch,
          instances: proc.pm2_env.instances,
          exec_mode: proc.pm2_env.exec_mode,
        })),
        summary: {
          total_processes: processes.length,
          online_processes: processes.filter(
            (p) => p.pm2_env.status === 'online'
          ).length,
          stopped_processes: processes.filter(
            (p) => p.pm2_env.status === 'stopped'
          ).length,
          errored_processes: processes.filter(
            (p) => p.pm2_env.status === 'errored'
          ).length,
          total_restarts: processes.reduce(
            (sum, p) => sum + p.pm2_env.restart_time,
            0
          ),
          total_memory: processes.reduce((sum, p) => sum + p.monit.memory, 0),
          average_cpu:
            processes.length > 0
              ? processes.reduce((sum, p) => sum + p.monit.cpu, 0) /
                processes.length
              : 0,
        },
      };

      // Save metrics to file
      fs.writeFileSync(this.metricsFile, JSON.stringify(metrics, null, 2));

      this.log(`Collected metrics for ${processes.length} processes`);
      return metrics;
    } catch (error) {
      this.log(`Error collecting metrics: ${error.message}`);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  async healthCheck() {
    try {
      const metrics = await this.collectMetrics();
      const issues = [];

      // Check for problematic processes
      metrics.processes.forEach((proc) => {
        if (proc.status !== 'online') {
          issues.push(`Process ${proc.name} is ${proc.status}`);
        }

        if (proc.restarts > 10) {
          issues.push(
            `Process ${proc.name} has restarted ${proc.restarts} times`
          );
        }

        if (proc.memory > 500 * 1024 * 1024) {
          // 500MB
          issues.push(
            `Process ${proc.name} is using ${Math.round(proc.memory / 1024 / 1024)}MB memory`
          );
        }

        if (proc.cpu > 80) {
          issues.push(`Process ${proc.name} is using ${proc.cpu}% CPU`);
        }
      });

      if (issues.length > 0) {
        this.log(`Health check issues found: ${issues.join(', ')}`);
        return { healthy: false, issues };
      } else {
        this.log('Health check passed - all processes healthy');
        return { healthy: true, issues: [] };
      }
    } catch (error) {
      this.log(`Health check failed: ${error.message}`);
      return {
        healthy: false,
        issues: [`Health check error: ${error.message}`],
      };
    }
  }

  async autoRestart() {
    try {
      await this.connect();
      const processes = await this.getProcessList();

      for (const proc of processes) {
        // Restart if process has too many restarts or high memory usage
        if (
          proc.pm2_env.restart_time > 20 ||
          proc.monit.memory > 800 * 1024 * 1024
        ) {
          this.log(`Auto-restarting ${proc.name} due to performance issues`);

          await new Promise((resolve, reject) => {
            pm2.restart(proc.name, (err) => {
              if (err) reject(err);
              else resolve();
            });
          });
        }
      }
    } catch (error) {
      this.log(`Auto-restart failed: ${error.message}`);
    } finally {
      await this.disconnect();
    }
  }

  async startMonitoring(interval = 60000) {
    // Default 1 minute
    this.log('Starting PM2 monitoring...');

    const monitor = async () => {
      try {
        await this.collectMetrics();
        await this.healthCheck();
      } catch (error) {
        this.log(`Monitoring error: ${error.message}`);
      }
    };

    // Initial run
    await monitor();

    // Set up interval monitoring
    setInterval(monitor, interval);

    this.log(`PM2 monitoring started with ${interval / 1000}s interval`);
  }
}

// CLI interface
if (require.main === module) {
  const monitor = new PM2Monitor();
  const command = process.argv[2];

  switch (command) {
    case 'metrics':
      monitor
        .collectMetrics()
        .then((metrics) => console.log(JSON.stringify(metrics, null, 2)))
        .catch(console.error);
      break;

    case 'health':
      monitor
        .healthCheck()
        .then((result) => console.log(JSON.stringify(result, null, 2)))
        .catch(console.error);
      break;

    case 'restart':
      monitor
        .autoRestart()
        .then(() => console.log('Auto-restart completed'))
        .catch(console.error);
      break;

    case 'monitor':
      const interval = parseInt(process.argv[3]) || 60000;
      monitor.startMonitoring(interval);
      break;

    default:
      console.log(`
Usage: node pm2-monitor.js <command>

Commands:
  metrics   - Collect and display current metrics
  health    - Run health check on all processes
  restart   - Auto-restart problematic processes
  monitor   - Start continuous monitoring (optional interval in ms)

Examples:
  node pm2-monitor.js metrics
  node pm2-monitor.js health
  node pm2-monitor.js monitor 30000
      `);
  }
}

module.exports = PM2Monitor;
