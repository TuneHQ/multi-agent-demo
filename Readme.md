# Multi-Agent Interactive Assistant

## Overview

A sophisticated multi-agent AI system designed to assist with restaurant bookings, scheduling, and research tasks using specialized agents.

## Prerequisites

- Node.js (v16+)
- npm
- API Keys

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/TuneHQ/multi-agent-demo
cd multi-agent-demo
npm install
```

### 2. Environment Configuration

Create a `.env` file with these variables:

```
MODEL_API_KEY=your_api_key_here
MODEL=model_name_here
SERPER_API_KEY=your_serper_api_key
ZOMATO_COOKIE=your_zomato_cookie
```

#### API Configuration

- **Preferred: TuneStudio**

  - API Key: [Obtain from TuneStudio](https://studio.tune.app)
  - Model: `openai/gpt-4o-mini`
  - Keep `baseURL: "https://proxy.tune.app"`

- **Alternative: OpenAI**
  - API Key: [Get from OpenAI](https://platform.openai.com/signup)
  - Model: `gpt-4o-mini`
  - Remove `baseURL` in OpenAI client configuration

### 3. Obtain Required API Keys

- **MODEL_API_KEY**:
  - [TuneStudio](https://studio.tune.app)
  - [OpenAI](https://platform.openai.com/signup)
- **SERPER_API_KEY**: [serper.dev](https://serper.dev/)
- **ZOMATO_COOKIE**: From Zomato (for restaurant-related functions)

## Running the Assistant

```bash
npm start
```

## Agents Overview

### 1. Concierge Agent

- Restaurant recommendations
- Table bookings
- Nearby restaurant search
- Slot availability checking

### 2. Scheduler Agent

- Meeting scheduling
- Calendar management
- Appointment reminders
- Time slot suggestions

### 3. Researcher Agent

- In-depth topic research
- Information analysis
- Report generation
- Source verification

### 4. Manager Agent

- Multi-task coordination
- Context maintenance
- Inter-agent communication
- Complex task decomposition

## Interaction Guide

- Use natural language commands
- Specify agent or task requirements
- Type "exit" to end session

## Example Interactions

```
You: Find a restaurant near me
Concierge: Here are nearby restaurants...

You: Schedule a meeting with my team
Scheduler: When would you like to meet?

You: Research AI trends in 2024
Researcher: Analyzing current AI landscape...
```

## [DEMO Video]


https://github.com/user-attachments/assets/6da3083c-5440-454d-9685-b579e14159f7

