# Feature 05: Timer e Pomodoro

## Contexto e Objetivo

**Prioridade:** 🟢 Baixa  
**Estimativa:** 3-4 horas  
**Tipo:** Feature

Adicionar timer Pomodoro para foco durante trabalho em tickets, ajudando desenvolvedores a gerenciar tempo e manter produtividade.

## Requisitos Técnicos

### Dependências

Não requer dependências adicionais.

### APIs Utilizadas

- `setInterval` / `clearInterval` para countdown
- `localStorage` para persistência de estado
- `Notification API` para notificações (opcional)
- `Audio API` para som de notificação

## Arquitetura e Design

### Máquina de Estados

```
IDLE
  ↓ start()
WORKING (25min)
  ↓ complete
BREAK (5min)
  ↓ complete
WORKING (25min)
  ...
```

### Estados do Timer

- **idle**: Timer não iniciado
- **working**: Período de trabalho (25min default)
- **break**: Período de descanso (5min default)
- **paused**: Timer pausado (pode voltar para working ou break)

## Arquivos a Criar

### 1. `src/app/hooks/usePomodoro.ts`

**Responsabilidade:** Lógica completa do timer Pomodoro.

```typescript
import { useState, useEffect, useRef, useCallback } from 'react';

export type PomodoroStatus = 'idle' | 'working' | 'break' | 'paused';

export interface PomodoroConfig {
  workDuration: number; // em minutos
  breakDuration: number; // em minutos
  longBreakDuration: number; // em minutos
  pomodorosUntilLongBreak: number;
}

export interface PomodoroState {
  status: PomodoroStatus;
  timeLeft: number; // em segundos
  totalTime: number; // em segundos
  completedPomodoros: number;
  currentTicketId?: string;
}

const DEFAULT_CONFIG: PomodoroConfig = {
  workDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  pomodorosUntilLongBreak: 4,
};

const STORAGE_KEY = 'pomodoro-state';

export const usePomodoro = (config: Partial<PomodoroConfig> = {}) => {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [state, setState] = useState<PomodoroState>(() => {
    // Carregar estado do localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      status: 'idle',
      timeLeft: fullConfig.workDuration * 60,
      totalTime: fullConfig.workDuration * 60,
      completedPomodoros: 0,
    };
  });
  
  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Persistir estado no localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);
  
  // Countdown logic
  useEffect(() => {
    if (state.status === 'working' || state.status === 'break') {
      intervalRef.current = window.setInterval(() => {
        setState(prev => {
          if (prev.timeLeft <= 1) {
            // Timer completado
            handleTimerComplete(prev);
            return prev;
          }
          return {
            ...prev,
            timeLeft: prev.timeLeft - 1,
          };
        });
      }, 1000);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [state.status]);
  
  const handleTimerComplete = useCallback((currentState: PomodoroState) => {
    // Play notification sound
    playNotificationSound();
    
    // Show browser notification
    showNotification(currentState.status);
    
    // Atualizar estado
    if (currentState.status === 'working') {
      const newCompletedPomodoros = currentState.completedPomodoros + 1;
      const isLongBreak = newCompletedPomodoros % fullConfig.pomodorosUntilLongBreak === 0;
      const breakDuration = isLongBreak ? fullConfig.longBreakDuration : fullConfig.breakDuration;
      
      setState({
        status: 'break',
        timeLeft: breakDuration * 60,
        totalTime: breakDuration * 60,
        completedPomodoros: newCompletedPomodoros,
        currentTicketId: currentState.currentTicketId,
      });
    } else if (currentState.status === 'break') {
      setState({
        status: 'working',
        timeLeft: fullConfig.workDuration * 60,
        totalTime: fullConfig.workDuration * 60,
        completedPomodoros: currentState.completedPomodoros,
        currentTicketId: currentState.currentTicketId,
      });
    }
  }, [fullConfig]);
  
  const start = useCallback((ticketId?: string) => {
    setState({
      status: 'working',
      timeLeft: fullConfig.workDuration * 60,
      totalTime: fullConfig.workDuration * 60,
      completedPomodoros: 0,
      currentTicketId: ticketId,
    });
  }, [fullConfig]);
  
  const pause = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'paused',
    }));
  }, []);
  
  const resume = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: prev.totalTime === fullConfig.workDuration * 60 ? 'working' : 'break',
    }));
  }, [fullConfig]);
  
  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setState({
      status: 'idle',
      timeLeft: fullConfig.workDuration * 60,
      totalTime: fullConfig.workDuration * 60,
      completedPomodoros: 0,
    });
  }, [fullConfig]);
  
  const skip = useCallback(() => {
    handleTimerComplete(state);
  }, [state, handleTimerComplete]);
  
  const playNotificationSound = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/notification.mp3'); // Adicionar arquivo de som
    }
    audioRef.current.play().catch(() => {
      // Ignorar erro se autoplay bloqueado
    });
  };
  
  const showNotification = (status: PomodoroStatus) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = status === 'working' ? 'Work session complete!' : 'Break complete!';
      const body = status === 'working' 
        ? 'Time for a break! 🎉' 
        : 'Ready to focus again? 💪';
      
      new Notification(title, {
        body,
        icon: '/logo.svg',
      });
    }
  };
  
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };
  
  // Formatters
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getProgress = (): number => {
    return ((state.totalTime - state.timeLeft) / state.totalTime) * 100;
  };
  
  return {
    state,
    start,
    pause,
    resume,
    reset,
    skip,
    formatTime: () => formatTime(state.timeLeft),
    getProgress,
    requestNotificationPermission,
  };
};
```

---

### 2. `src/app/components/ui/Pomodoro.tsx`

**Responsabilidade:** Componente visual do timer.

```typescript
import React from 'react';
import { usePomodoro, PomodoroStatus } from '@/app/hooks/usePomodoro';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { Play, Pause, RotateCcw, SkipForward, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PomodoroProps {
  ticketId?: string;
  compact?: boolean;
}

export const Pomodoro: React.FC<PomodoroProps> = ({ ticketId, compact = false }) => {
  const {
    state,
    start,
    pause,
    resume,
    reset,
    skip,
    formatTime,
    getProgress,
    requestNotificationPermission,
  } = usePomodoro();
  
  const getStatusColor = (status: PomodoroStatus): string => {
    switch (status) {
      case 'working': return 'text-red-500';
      case 'break': return 'text-green-500';
      case 'paused': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };
  
  const getStatusText = (status: PomodoroStatus): string => {
    switch (status) {
      case 'working': return 'Focus Time 🎯';
      case 'break': return 'Break Time ☕';
      case 'paused': return 'Paused ⏸️';
      default: return 'Ready to start';
    }
  };
  
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className={cn('font-mono text-sm', getStatusColor(state.status))}>
          {formatTime()}
        </span>
        {state.status === 'idle' && (
          <Button size="sm" variant="outline" onClick={() => start(ticketId)}>
            <Play className="h-3 w-3" />
          </Button>
        )}
        {(state.status === 'working' || state.status === 'break') && (
          <Button size="sm" variant="outline" onClick={pause}>
            <Pause className="h-3 w-3" />
          </Button>
        )}
        {state.status === 'paused' && (
          <Button size="sm" variant="outline" onClick={resume}>
            <Play className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Status */}
          <div className={cn('text-sm font-medium', getStatusColor(state.status))}>
            {getStatusText(state.status)}
          </div>
          
          {/* Timer */}
          <div className="text-6xl font-mono font-bold">
            {formatTime()}
          </div>
          
          {/* Progress bar */}
          <Progress value={getProgress()} className="w-full" />
          
          {/* Pomodoros completados */}
          <div className="text-sm text-muted-foreground">
            Pomodoros completed: {state.completedPomodoros} 🍅
          </div>
          
          {/* Controls */}
          <div className="flex gap-2">
            {state.status === 'idle' && (
              <>
                <Button onClick={() => start(ticketId)}>
                  <Play className="mr-2 h-4 w-4" />
                  Start
                </Button>
                <Button 
                  variant="outline" 
                  onClick={requestNotificationPermission}
                  title="Enable notifications"
                >
                  <Bell className="h-4 w-4" />
                </Button>
              </>
            )}
            
            {(state.status === 'working' || state.status === 'break') && (
              <>
                <Button onClick={pause}>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </Button>
                <Button variant="outline" onClick={skip}>
                  <SkipForward className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={reset}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </>
            )}
            
            {state.status === 'paused' && (
              <>
                <Button onClick={resume}>
                  <Play className="mr-2 h-4 w-4" />
                  Resume
                </Button>
                <Button variant="outline" onClick={reset}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </>
            )}
          </div>
          
          {/* Keyboard shortcuts hint */}
          <div className="text-xs text-muted-foreground">
            Tip: Press <kbd className="kbd">Cmd</kbd> + <kbd className="kbd">P</kbd> to pause/resume
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

## Arquivos a Editar

### 1. `src/app/pages/TicketEditPage.tsx`

**Mudanças:** Integrar widget Pomodoro.

```typescript
import { Pomodoro } from '@/app/components/ui/Pomodoro';

// No JSX, adicionar após header ou em sidebar:

<div className="mb-6">
  <Pomodoro ticketId={ticket?.id} />
</div>
```

### 2. `src/app/components/layouts/MainLayout.tsx` (Opcional)

**Mudanças:** Adicionar Pomodoro compacto no header.

```typescript
import { Pomodoro } from '@/app/components/ui/Pomodoro';

// No header:

<div className="flex items-center gap-4">
  <Pomodoro compact />
  {/* ... outros elementos do header */}
</div>
```

### 3. `src/app/hooks/useKeyboardShortcuts.ts`

**Mudanças:** Adicionar atalho Cmd+P para Pomodoro.

```typescript
// Adicionar handler:
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
      e.preventDefault();
      // Toggle pomodoro play/pause
      // Precisa de referência ao hook usePomodoro
    }
  };
  
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, []);
```

## Plano de Implementação Detalhado

### Fase 1: Hook Logic (1.5-2h)

1. **Criar `usePomodoro.ts`**
   - Estados básicos
   - Countdown logic
   - Persistência em localStorage

2. **Implementar transições de estado**
   - work → break
   - break → work
   - pause/resume

3. **Testar hook isoladamente**
   - Unit tests ou testes manuais
   - Verificar persistência

### Fase 2: UI Component (1h)

4. **Criar `Pomodoro.tsx`**
   - Modo normal (card)
   - Modo compact

5. **Estilizar componente**
   - Cores por status
   - Progress bar
   - Animations

### Fase 3: Notificações (30min)

6. **Implementar notificações**
   - Browser notifications
   - Som de notificação
   - Permissões

7. **Adicionar arquivo de som**
   - `public/notification.mp3`
   - Testar playback

### Fase 4: Integração (30min-1h)

8. **Integrar em `TicketEditPage.tsx`**
   - Adicionar widget
   - Passar ticketId

9. **Integrar em `MainLayout.tsx` (opcional)**
   - Modo compact no header
   - Acessível de qualquer página

10. **Adicionar atalhos de teclado**
    - Cmd+P para play/pause

### Fase 5: Polish (30min)

11. **Refinamentos**
    - Loading states
    - Error handling
    - Accessibility

12. **Testes finais**
    - Timer completo (work + break)
    - Múltiplos pomodoros
    - Persistência entre reloads

## Estruturas de Dados

### PomodoroState em localStorage

```json
{
  "status": "working",
  "timeLeft": 1200,
  "totalTime": 1500,
  "completedPomodoros": 2,
  "currentTicketId": "ticket-123"
}
```

### PomodoroConfig

```typescript
{
  workDuration: 25,        // minutos
  breakDuration: 5,        // minutos
  longBreakDuration: 15,   // minutos
  pomodorosUntilLongBreak: 4
}
```

## Casos de Uso

### Caso 1: Iniciar Pomodoro ao Trabalhar em Ticket

1. Developer abre ticket
2. Clica em "Start" no widget Pomodoro
3. Timer inicia (25min)
4. Developer trabalha focado
5. Timer termina e toca notificação
6. Break automático começa (5min)
7. Developer descansa
8. Timer termina e toca notificação
9. Novo ciclo de trabalho começa

### Caso 2: Pausar e Retomar

1. Developer está em pomodoro ativo
2. Interrupção urgente acontece
3. Developer clica "Pause"
4. Timer pausa
5. Após resolver interrupção, clica "Resume"
6. Timer continua de onde parou

### Caso 3: Skip Break

1. Developer completa work session
2. Break automático começa
3. Developer se sente bem, não precisa de break
4. Clica "Skip"
5. Próximo work session começa imediatamente

## Validação e Testes

### Checklist de Validação

- [ ] Timer inicia com 25 minutos
- [ ] Countdown funciona corretamente
- [ ] Transição work → break funciona
- [ ] Transição break → work funciona
- [ ] Long break acontece a cada 4 pomodoros
- [ ] Pause/resume funciona
- [ ] Reset funciona
- [ ] Skip funciona
- [ ] Estado persiste no localStorage
- [ ] Notificação visual aparece ao terminar
- [ ] Notificação sonora toca ao terminar
- [ ] Browser notification funciona (se permitido)
- [ ] Progress bar atualiza corretamente
- [ ] Contador de pomodoros atualiza
- [ ] Modo compact funciona
- [ ] Atalho Cmd+P funciona

### Cenários de Erro

- [ ] Notification bloqueada pelo browser
- [ ] Autoplay de audio bloqueado
- [ ] localStorage cheio
- [ ] Timer rodando em background (aba fechada)

## Possíveis Desafios e Soluções

### Desafio 1: Timer Drift

**Problema:** `setInterval` não é preciso, pode ter drift acumulado.

**Solução:**
```typescript
// Usar timestamp ao invés de contador
const startTime = Date.now();
const endTime = startTime + (duration * 1000);

setInterval(() => {
  const now = Date.now();
  const remaining = Math.max(0, endTime - now);
  setTimeLeft(Math.ceil(remaining / 1000));
}, 100); // Update mais frequentemente
```

### Desafio 2: Background Tabs

**Problema:** Timer pode não funcionar quando aba está em background.

**Solução:**
- Salvar `endTime` no localStorage
- Ao retomar aba, calcular tempo restante baseado em timestamp
- Page Visibility API para detectar quando aba volta

```typescript
useEffect(() => {
  const handler = () => {
    if (document.visibilityState === 'visible') {
      // Recalcular tempo restante
      syncTimerFromStorage();
    }
  };
  
  document.addEventListener('visibilitychange', handler);
  return () => document.removeEventListener('visibilitychange', handler);
}, []);
```

### Desafio 3: Notificações Bloqueadas

**Problema:** Browser pode bloquear notificações.

**Solução:**
- Pedir permissão explicitamente
- Botão "Enable Notifications"
- Fallback para notificação visual dentro do app

### Desafio 4: Som Não Toca

**Problema:** Autoplay de audio pode ser bloqueado.

**Solução:**
- Usar audio apenas após interação do usuário
- Fallback para vibração (mobile)
- Visual notification sempre funcionará

## UI/UX Detalhes

### Modo Normal (Card)

```
┌─────────────────────────────┐
│      Focus Time 🎯          │
│                             │
│        25:00                │
│                             │
│ ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░        │
│                             │
│  Pomodoros completed: 2 🍅  │
│                             │
│  [⏸️ Pause]  [⏭️]  [🔄]      │
│                             │
│  Tip: Cmd+P to pause/resume │
└─────────────────────────────┘
```

### Modo Compact

```
🎯 25:00 [⏸️]
```

### Estados Visuais

- **Working**: Texto vermelho, barra progresso vermelha
- **Break**: Texto verde, barra progresso verde
- **Paused**: Texto amarelo, barra progresso amarela
- **Idle**: Texto cinza

## Critérios de Aceite

- ✅ Timer inicia/pausa/reseta
- ✅ Countdown é preciso (sem drift significativo)
- ✅ Transições work ↔ break funcionam
- ✅ Notificação ao finalizar período (visual + sonora)
- ✅ Estado persiste entre sessões (localStorage)
- ✅ Long break a cada 4 pomodoros
- ✅ Modo compact funciona
- ✅ Atalho Cmd+P funciona
- ✅ Progress bar reflete tempo restante
- ✅ Funciona em background tabs

---

**Última atualização:** Janeiro 2025  
**Status:** Aguardando implementação

