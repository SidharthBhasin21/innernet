# AGENTS.md

# Innernet --- Frontend Prototype Instructions

## 1. Product Overview

Innernet is an **agent-first social network** built around an infinite
canvas.

The core idea is that every human user has **one personal AI agent
attached to their account**. The agent represents the user, maintains
context about that user, and can interact with the agents of the user's
social connections to answer questions using trusted social knowledge.

There are **no separate bot accounts**. An agent is not a person,
profile, or social account. It is an AI capability attached to a human
account.

The first version is a **frontend-only prototype**. The purpose of this
prototype is to validate the interaction model, canvas experience,
visual language, and agent-first UX before building backend
infrastructure.

### Current prototype scope

Build:

-   Infinite canvas
-   Canvas-based agent chats
-   Persistent chat cards/nodes
-   Mock agent behavior
-   Mock agent-to-agent research
-   Mock social graph
-   Mock knowledge/provenance
-   Resizable chat cards
-   Chat context persistence in frontend state
-   Feed
-   Connections
-   Visual activity/progress states
-   Responsive, polished UI

Do **not** build yet:

-   Backend
-   Authentication
-   Real database
-   Real user accounts
-   Real agent orchestration
-   Real agent-to-agent networking
-   Production knowledge graph
-   Production permissions system
-   Real social graph service
-   Real-time infrastructure
-   Production LLM infrastructure
-   Explore section

All of those can be introduced later after the UI and interaction model
are finalized.

------------------------------------------------------------------------

# 2. Product Philosophy

Innernet should feel like a combination of:

-   An infinite creative workspace
-   A personal AI assistant
-   A social network
-   A trusted recommendation network

The primary mental model is:

> **I talk to my agent. My agent talks to the people I trust.**

The user should never feel like they are manually orchestrating multiple
agents.

Internally, the system may eventually communicate with many agents, but
the user interacts with **one personal agent**.

The complexity of the network should be hidden unless the user
explicitly wants to inspect it.

------------------------------------------------------------------------

# 3. Core Agent Model

Each human account owns exactly one personal agent.

Example:

``` text
Sidharth
└── Sidharth's Agent
```

The agent can have multiple independent canvas conversations:

``` text
Sidharth
└── Personal Agent
    ├── Japan Trip
    ├── Restaurant Research
    ├── Product Ideas
    ├── Fitness Plan
    └── Budget Planning
```

Every canvas chat has its **own context**.

A chat contains:

-   Conversation history
-   User messages
-   Agent responses
-   Research/activity state
-   Related people
-   Sources/provenance
-   Attachments
-   Position on canvas
-   Size
-   Title
-   Status
-   Optional relationships to other chats

The underlying personal agent is shared, but each chat maintains its own
context.

------------------------------------------------------------------------

# 4. Infinite Canvas

The canvas is the primary experience.

Users can:

-   Pan
-   Zoom
-   Create chats anywhere
-   Move chat cards
-   Resize chat cards
-   Connect related chats
-   Inspect chat activity
-   Continue conversations
-   Organize their thinking spatially

Use **React Flow** as the canvas foundation.

Do not replace React Flow with a custom canvas implementation unless
there is a concrete technical limitation that makes React Flow
unsuitable.

The canvas should support:

``` text
Pan
Zoom
Node positioning
Node resizing
Node selection
Node connections
Node dragging
Viewport persistence
```

### Creating a chat

Clicking an empty area of the canvas should create/open a composer at
that location.

The interaction should be:

``` text
Click canvas
    ↓
Composer appears at click position
    ↓
User enters prompt
    ↓
Chat node is created
    ↓
Agent begins responding
```

Do not require users to go to a separate chat page to create a
conversation.

The canvas is the chat workspace.

------------------------------------------------------------------------

# 5. Chat Node Design

Chat nodes start compact.

A new node should initially be small and visually lightweight.

Example:

``` text
┌─────────────────────────┐
│ ✨ Japan Trip           │
│                         │
│ Planning a 7 day trip   │
│ to Japan...             │
└─────────────────────────┘
```

As the conversation grows, the node can grow.

Users can manually resize nodes.

The system should support:

``` text
Compact
    ↓
Expanded
    ↓
Large conversation
```

Do not force every conversation into a large chat window.

The canvas should remain spatial and uncluttered.

------------------------------------------------------------------------

# 6. Chat Context

Every chat has isolated context by default.

For example:

``` text
Japan Trip
```

does not automatically share all information with:

``` text
Fitness Plan
```

However, chats can explicitly be connected.

When chats are connected, controlled context sharing becomes possible.

Example:

``` text
Japan Trip
     │
     ├────→ Restaurant Research
     │
     └────→ Budget Planning
```

A connected chat can receive relevant context from another chat.

Do not silently merge all canvas conversations into one global context.

------------------------------------------------------------------------

# 7. Agent-to-Agent Knowledge

The defining feature of Innernet is social agent knowledge.

When a user asks their agent something, the conceptual flow is:

``` text
User
  ↓
Personal Agent
  ↓
Connections
  ↓
Friends of Friends
  ↓
Knowledge aggregation
  ↓
Final answer
```

The social graph should extend to **friends of friends only**.

Do not query third-degree connections or the general social graph in
this prototype.

------------------------------------------------------------------------

# 8. Mock Agent Network

The prototype must simulate the agent network entirely on the frontend.

Create mock users such as:

``` text
Sidharth
Priya Sharma
Arjun Mehta
Meera Kapoor
Karan Singh
Rohan Verma
```

Each mock user should have a mock personal agent.

The agents can contain mock knowledge such as:

``` text
Restaurant experiences
Travel experiences
Product opinions
Places visited
Recommendations
Ratings
Comments
```

Example:

``` text
Priya's Agent
    ├── Visited ABC Restaurant
    ├── Rating: 5/5
    └── Comment: "Excellent food and ambience."
```

The purpose is not to fake a production backend.

The purpose is to make the **agent-network interaction understandable
and believable in the prototype**.

------------------------------------------------------------------------

# 9. Mock Agent Research Flow

A question such as:

> "What's the best restaurant in Mumbai?"

should visually simulate an actual network lookup.

Example:

``` text
User
 ↓
My Agent
 ↓
Checking your connections
 ↓
Priya's Agent
Arjun's Agent
Meera's Agent
 ↓
Checking friends of friends
 ↓
Aggregating experiences
 ↓
Comparing opinions
 ↓
Generating recommendation
```

The underlying implementation can use deterministic mock data.

Do not build real multi-agent infrastructure yet.

------------------------------------------------------------------------

# 10. Agent Activity / Process UI

The user may optionally inspect what their agent is doing.

Do not expose hidden chain-of-thought or private model reasoning.

Instead, expose a **high-level activity/progress view**.

Examples:

``` text
Checking your connections...
```

``` text
Asked 3 people in your network
```

``` text
Found 7 relevant experiences
```

``` text
Comparing recommendations
```

``` text
Building your answer
```

The user can choose whether to expand this activity view.

The default experience should remain clean.

Do not force a large step-by-step process panel into every response.

------------------------------------------------------------------------

# 11. Recommendation Provenance

Answers should make the source of social knowledge understandable.

Example:

``` text
7 people in your network recommend this place.
```

The user can click the count.

This opens a people/provenance view.

Example:

``` text
People who recommended this

Priya Sharma
★★★★★
"Excellent food."

Arjun Mehta
★★★★☆
"Great ambience."

Meera Kapoor
★★★★★
"Would definitely visit again."
```

The initial answer can summarize the network without naming every
person.

Users can explicitly request the details.

------------------------------------------------------------------------

# 12. Social Knowledge Summary

Recommendations should be able to show information such as:

``` text
Based on:

• 3 friends
• 4 friends of friends
• 12 public reviews
```

Where appropriate, the UI can summarize common themes:

``` text
People particularly liked:

✓ Food
✓ Ambience
✓ Location
```

The system should preserve disagreement.

If people have conflicting experiences, do not collapse them into a
misleading single opinion.

Example:

``` text
3 friends loved it.

2 people had negative experiences,
mostly related to service.
```

The prototype should demonstrate that the agent can reason over
conflicting social information.

------------------------------------------------------------------------

# 13. Trust Model

The long-term system should treat social proximity as a meaningful trust
signal.

For the prototype, the social graph should distinguish:

``` text
Direct connection
Friend of friend
```

Direct connections are more trusted than friends of friends.

Do not invent complicated numerical trust scores in the prototype unless
required by the UI.

Keep the model understandable.

------------------------------------------------------------------------

# 14. Privacy and Agent Permissions

A user's agent can answer questions on behalf of the user, but only
according to that user's permissions.

The prototype should include a conceptual privacy/agent-sharing model.

Possible categories include:

``` text
Restaurant experiences
Travel experiences
Product reviews
Personal conversations
Location
Financial information
Health information
```

The UI should communicate that the user controls what their agent can
share.

Do not imply that agents have unrestricted access to another user's
private information.

------------------------------------------------------------------------

# 15. Social Graph

A connection represents the user's social relationship.

For the prototype:

``` text
Connection = Friend / Following
```

There does not need to be a separate distinction between:

-   Friend
-   Following
-   Connection

unless a later product decision introduces one.

The left sidebar can display connections and recent activity.

The prototype should use mock connections.

------------------------------------------------------------------------

# 16. Feed

The initial prototype includes:

-   Canvas
-   Feed

Explore is intentionally postponed.

The Feed should feel familiar to users of platforms such as Instagram
and Twitter/X.

The feed is a normal social feed where people can share things with
their connections.

Posts may contain:

-   Text
-   Images
-   Agent-generated results that the user chooses to share
-   Recommendations
-   Research
-   Experiences
-   Links
-   Media

Agents should **not autonomously publish posts**.

A human user must initiate sharing.

------------------------------------------------------------------------

# 17. Agent vs Human

Never represent the agent as a separate social account.

Incorrect:

``` text
Sidharth
Sidharth Bot
Sidharth AI
```

Correct:

``` text
Sidharth
Personal Agent
```

The agent belongs to the human account.

The agent can act on behalf of the human but does not become another
social identity.

------------------------------------------------------------------------

# 18. Canvas + Social Feed Relationship

The canvas is the primary workspace.

The feed is the social layer around that workspace.

Conceptually:

``` text
                 Innernet

        ┌─────────────────────┐
        │      Canvas         │
        │                     │
        │  Agent conversations│
        │  Research           │
        │  Ideas              │
        │  Knowledge          │
        └─────────────────────┘

                    ↕

        ┌─────────────────────┐
        │       Feed          │
        │                     │
        │  People             │
        │  Posts              │
        │  Shared discoveries │
        └─────────────────────┘
```

Do not make the Feed dominate the product.

The canvas should remain the primary interaction.

------------------------------------------------------------------------

# 19. UI Direction

The supplied Innernet reference designs are the visual source of truth.

The interface should preserve the established visual language:

-   Minimal
-   Bright
-   Spacious
-   Soft surfaces
-   Rounded cards
-   Subtle borders
-   Light shadows
-   Gentle gradients
-   Purple/blue accent language
-   High readability
-   Premium feel
-   Calm interaction design

The canvas should feel open and uncluttered.

Avoid:

-   Dense dashboards
-   Heavy borders
-   Excessive gradients
-   Excessive animation
-   Dark enterprise-style UI
-   Unnecessary panels
-   Traditional chatbot layouts

The visual design should feel like a modern social/productivity
environment rather than an AI control panel.

------------------------------------------------------------------------

# 20. Reference UI Structure

The current prototype can use the following high-level structure:

``` text
┌──────────────┬──────────────────────────────┬──────────────┐
│              │                              │              │
│   Sidebar    │          Canvas              │    Feed      │
│              │                              │              │
│  Canvas      │    Agent conversations       │  For You     │
│  Feed        │    Infinite workspace        │  Following   │
│              │                              │  Posts       │
│  Connections │                              │              │
│              │                              │              │
│  Agent Chats │                              │              │
│              │                              │              │
└──────────────┴──────────────────────────────┴──────────────┘
```

The exact layout can evolve during UI iteration.

Do not unnecessarily redesign the established visual direction.

------------------------------------------------------------------------

# 21. Frontend Architecture

Use:

``` text
React
TypeScript
Tailwind CSS
React Flow
```

Use a component-driven architecture.

Recommended conceptual structure:

``` text
src/
├── components/
│   ├── canvas/
│   ├── chat/
│   ├── feed/
│   ├── connections/
│   ├── agent/
│   ├── layout/
│   └── ui/
│
├── data/
│   ├── mockUsers
│   ├── mockConnections
│   ├── mockAgents
│   ├── mockKnowledge
│   ├── mockPosts
│   └── mockChats
│
├── hooks/
├── lib/
├── types/
├── store/
└── pages/
```

Keep domain logic separated from presentation.

Do not place all prototype behavior in one giant component.

------------------------------------------------------------------------

# 22. State Management

The prototype needs frontend state for:

-   Canvas nodes
-   Canvas edges
-   Chat messages
-   Chat context
-   Node positions
-   Node dimensions
-   Selected node
-   Active composer
-   Agent activity
-   Mock network interactions
-   Feed state
-   Connections
-   User preferences

Use a simple state architecture appropriate for a prototype.

Do not introduce Redux or a complex state-management system unless there
is a clear need.

React state/context or a lightweight store is preferred.

------------------------------------------------------------------------

# 23. Data Modeling

Even though there is no backend, structure mock data as if it could
later be persisted.

Example conceptual types:

``` ts
type User = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  connectionIds: string[];
};

type Agent = {
  id: string;
  userId: string;
};

type Chat = {
  id: string;
  agentId: string;
  title: string;
  messages: Message[];
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
};

type Message = {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: string;
};

type KnowledgeItem = {
  id: string;
  userId: string;
  type: string;
  subject: string;
  content: string;
  rating?: number;
  timestamp: string;
};
```

Exact schemas can evolve.

The important rule is to model the prototype around the eventual product
concepts rather than arbitrary UI-only objects.

------------------------------------------------------------------------

# 24. Mock Data

Mock data should be realistic enough to demonstrate the product.

Include:

### Users

At minimum:

-   Sidharth
-   Priya Sharma
-   Arjun Mehta
-   Meera Kapoor
-   Karan Singh
-   Rohan Verma

### Connections

Create a graph where some users are direct connections and others are
friends of friends.

### Knowledge

Include experiences for:

-   Restaurants
-   Travel
-   Products
-   Places
-   Fitness
-   Research

### Feed

Include realistic posts with:

-   Avatar
-   Username
-   Timestamp
-   Text
-   Images
-   Engagement counts
-   Optional shared agent results

------------------------------------------------------------------------

# 25. Prototype Agent Engine

The prototype should have a small frontend-only mock agent engine.

Conceptually:

``` ts
askAgent({
  chatId,
  prompt,
});
```

It should be responsible for simulating:

``` text
User question
    ↓
Intent detection
    ↓
Network lookup
    ↓
Connection lookup
    ↓
Friend-of-friend lookup
    ↓
Knowledge aggregation
    ↓
Opinion comparison
    ↓
Response generation
```

This can be deterministic/mock logic.

The UI should make it possible to replace this implementation later with
a real backend agent service.

Do not couple the UI directly to hardcoded response strings everywhere.

------------------------------------------------------------------------

# 26. Agent Activity Model

Represent activity as structured frontend state rather than manually
manipulating UI text.

Example:

``` ts
type AgentActivity = {
  status:
    | "idle"
    | "thinking"
    | "searching_connections"
    | "searching_friends_of_friends"
    | "aggregating"
    | "comparing"
    | "responding"
    | "complete";

  message: string;
};
```

This allows the prototype to animate through realistic agent states.

------------------------------------------------------------------------

# 27. Knowledge Graph Simulation

The prototype should simulate the concept of a continuously updated
knowledge graph.

Do not build a real graph database.

Represent relationships in frontend data.

Example:

``` text
User
 ↓
Experience
 ↓
Place
 ↓
Recommendation
```

and:

``` text
User
 ↓
Connection
 ↓
User
 ↓
Experience
```

The architecture should leave room for this to become a real knowledge
graph later.

------------------------------------------------------------------------

# 28. Chat Connections

Users should be able to connect related canvas chats.

For example:

``` text
Japan Trip
    │
    ├──── Restaurant Research
    │
    └──── Budget Planning
```

Use React Flow edges for these relationships.

Connections should have visual meaning.

Avoid decorative edges that do not represent actual relationships.

------------------------------------------------------------------------

# 29. Resizing

Chat nodes should be resizable.

The node should support:

-   Minimum width
-   Minimum height
-   User-controlled resizing
-   Content-aware growth where practical
-   Smooth transitions

Do not allow nodes to become so large that they destroy the canvas
experience.

------------------------------------------------------------------------

# 30. Persistence in Prototype

There is no backend.

Use frontend persistence where useful, such as:

``` text
localStorage
```

for:

-   Canvas layout
-   Node positions
-   Node sizes
-   Chats
-   User preferences

This should make the prototype feel persistent across page reloads.

Do not treat localStorage as the eventual production data layer.

------------------------------------------------------------------------

# 31. Navigation

Primary navigation:

``` text
Canvas
Feed
```

Explore should not be implemented yet.

The navigation should be visually present only if necessary for the
design, but functionality should focus on Canvas and Feed.

------------------------------------------------------------------------

# 32. Responsive Behavior

Desktop is the primary target for the prototype because the infinite
canvas is the core experience.

Do not compromise the desktop canvas to optimize for mobile prematurely.

However, components should still be structured so responsive behavior
can be added later.

------------------------------------------------------------------------

# 33. Animation

Use animation purposefully.

Good uses:

-   Agent activity
-   Node creation
-   Node expansion
-   Feed interactions
-   Canvas transitions
-   Composer appearance
-   Connection creation

Avoid excessive animation.

The UI should feel alive, not distracting.

------------------------------------------------------------------------

# 34. Accessibility

Use semantic HTML where possible.

Ensure:

-   Keyboard navigation where practical
-   Visible focus states
-   Accessible buttons
-   Accessible labels
-   Sufficient contrast
-   Reduced-motion consideration

Canvas interactions can have specialized keyboard behavior, but basic
controls must remain accessible.

------------------------------------------------------------------------

# 35. Error States

Even a prototype should demonstrate realistic states.

Include:

-   Empty canvas
-   Empty feed
-   Agent thinking
-   Agent researching
-   Agent completed
-   Agent unable to find relevant social knowledge
-   No connections with relevant knowledge
-   Failed mock research
-   Long-running research
-   Network unavailable simulation where useful

Do not make every state successful.

The prototype should communicate what happens when the social network
has no answer.

------------------------------------------------------------------------

# 36. Loading States

Agent loading should feel like an agent working rather than a generic
spinner.

Prefer contextual states:

``` text
Checking your network...
```

``` text
Looking through experiences...
```

``` text
Comparing recommendations...
```

rather than:

``` text
Loading...
```

------------------------------------------------------------------------

# 37. Empty Canvas

The empty canvas is a first-class state.

It should clearly communicate:

> Click anywhere to start a new chat.

The user should immediately understand that the entire canvas is
interactive.

The empty state should remain visually minimal and should not look like
a traditional chatbot landing page.

------------------------------------------------------------------------

# 38. Empty Canvas Interaction

The empty canvas should allow the user to click anywhere.

The click position should influence where the composer/chat node
appears.

Do not force the user to click a central "New Chat" button.

A global new-chat button may exist as a secondary convenience, but the
primary interaction is spatial creation.

------------------------------------------------------------------------

# 39. Feed Rules

Feed posts should feel like normal social content.

Do not turn every feed post into an AI card.

AI should be part of the platform, not the visual treatment of every
piece of content.

A user should be able to share:

-   Photos
-   Text
-   Experiences
-   Links
-   Agent results
-   Recommendations

without the interface feeling like an AI dashboard.

------------------------------------------------------------------------

# 40. No Autonomous Posting

Agents must never automatically publish to the user's social feed.

Correct:

``` text
Agent generates result
        ↓
User chooses "Share"
        ↓
Post composer
        ↓
User publishes
```

Incorrect:

``` text
Agent generates result
        ↓
Automatically posts
```

------------------------------------------------------------------------

# 41. Source Transparency

Whenever an agent answer uses social knowledge, the prototype should be
capable of showing where that knowledge came from.

At minimum:

``` text
Number of relevant people
```

On interaction:

``` text
Specific people
Their relationship to the user
Their relevant experience
Their opinion
Timestamp
```

The design should make provenance feel like a trust feature rather than
technical metadata.

------------------------------------------------------------------------

# 42. Privacy Principle

Never design the prototype in a way that suggests:

> "The AI can access everything about everyone."

The correct mental model is:

> "People control what their personal agent is allowed to share."

This principle should remain true when backend functionality is
eventually introduced.

------------------------------------------------------------------------

# 43. Security Principle

Even though this is a frontend prototype, do not hardcode architecture
that would make a production permission model impossible.

Assume the eventual system will have:

``` text
User
 ↓
Agent
 ↓
Permission Gateway
 ↓
Other Agent
```

rather than direct unrestricted access between users' agents.

------------------------------------------------------------------------

# 44. Future Architecture Boundary

The prototype should be designed so that the following can later replace
mock implementations:

``` text
Mock Agent Engine
        ↓
Real Agent Orchestrator

Mock Users
        ↓
Real Authentication

Mock Knowledge
        ↓
Real Knowledge Graph

Mock Connections
        ↓
Real Social Graph

localStorage
        ↓
Backend persistence

Frontend-only permissions
        ↓
Server-enforced permissions
```

Do not tightly couple prototype components to mock implementation
details.

------------------------------------------------------------------------

# 45. Coding Principles

Prefer:

-   Small components
-   Clear TypeScript types
-   Reusable primitives
-   Domain-oriented components
-   Predictable state
-   Explicit props
-   Simple abstractions
-   Readable code

Avoid:

-   Giant components
-   Deeply nested conditional rendering
-   Duplicated mock data
-   Hardcoded UI behavior across components
-   Premature abstraction
-   Overengineering
-   Backend assumptions

------------------------------------------------------------------------

# 46. Component Principles

Components should represent product concepts.

Good:

``` text
Canvas
ChatNode
ChatComposer
AgentActivity
AgentResponse
ProvenanceSummary
PeopleWhoRecommended
ConnectionList
Feed
FeedPost
```

Avoid generic components that hide important product behavior.

Generic UI primitives can be shared when appropriate.

------------------------------------------------------------------------

# 47. Visual Consistency

Use a consistent design system.

Maintain:

-   Border radius scale
-   Typography scale
-   Spacing scale
-   Shadow scale
-   Icon style
-   Avatar treatment
-   Button styles
-   Input styles
-   Card styles

Do not introduce arbitrary values throughout the application.

Tailwind utility classes are preferred.

------------------------------------------------------------------------

# 48. Product Naming

The product name is:

# Innernet

Use **Innernet** consistently in:

-   Page titles
-   Branding
-   Empty states
-   Documentation
-   Mock content where relevant

Do not use "Orb" as the product name.

The existing Orb-style visual reference is a design reference only.

------------------------------------------------------------------------

# 49. Development Priorities

Prioritize work in this order:

## Priority 1 --- Infinite Canvas

The canvas experience is the most important part of the prototype.

It must feel:

-   Fast
-   Spacious
-   Natural
-   Interactive
-   Stable
-   Visually polished

## Priority 2 --- Chat Creation

Click anywhere → create chat.

## Priority 3 --- Chat Nodes

Compact → expandable → resizable.

## Priority 4 --- Mock Agent Experience

Make the agent feel alive and capable.

## Priority 5 --- Agent Network Visualization

Demonstrate:

``` text
My Agent
 ↓
Connections
 ↓
Friends of Friends
 ↓
Knowledge
```

## Priority 6 --- Provenance

Show where recommendations came from.

## Priority 7 --- Feed

Build the social layer.

------------------------------------------------------------------------

# 50. Definition of Done for the Prototype

The prototype is successful when a new user can:

1.  Open Innernet.
2.  Understand that the canvas is the primary workspace.
3.  Click anywhere on the canvas.
4.  Create a new chat.
5.  Ask a question.
6.  See the chat remain on the canvas.
7.  Watch the mock agent perform high-level research.
8.  See that the agent can consult connections.
9.  See that it can consult friends of friends.
10. Receive a recommendation.
11. See how many people contributed.
12. Inspect who contributed.
13. See disagreement between people where relevant.
14. Resize the conversation.
15. Connect conversations.
16. Return later and find the canvas state preserved.
17. Navigate to the Feed.
18. Browse normal social posts.
19. Share an agent result manually.

The experience should make the following concept immediately
understandable:

> **Your AI doesn't just know things. It can ask the people you know.**

------------------------------------------------------------------------

# 51. What Not to Build Yet

Do not implement unless explicitly requested:

-   Authentication
-   Backend APIs
-   PostgreSQL
-   MongoDB
-   Redis
-   WebSockets
-   Real agent orchestration
-   Real LLM API integration
-   Vector databases
-   Graph databases
-   Production permissions
-   Production notifications
-   Payments
-   Moderation infrastructure
-   Explore
-   Recommendation ranking infrastructure
-   Production search
-   Production analytics
-   Mobile applications

The prototype should validate the product interaction before
infrastructure is introduced.

------------------------------------------------------------------------

# 52. Decision-Making Rule for Future Agents

When an implementation decision is unclear, prioritize:

1.  Infinite canvas experience
2.  Simplicity
3.  User understanding
4.  Visual consistency
5.  Prototype speed
6.  Future architectural flexibility

Do not build infrastructure simply because it might be useful later.

The prototype exists to answer:

> **Does this interaction model feel compelling?**

not:

> **Can we build the final production architecture today?**

------------------------------------------------------------------------

# 53. Source of Truth

When making UI decisions, use the provided Innernet design references as
the visual source of truth.

When making product behavior decisions, use this document and the
product requirements defined by the user as the source of truth.

If an implementation conflicts with either:

-   Prefer the explicit product requirement over assumptions.
-   Prefer the existing visual language over introducing a new design
    direction.
-   Ask for clarification when a decision materially changes the product
    experience.

Do not invent major product features.

------------------------------------------------------------------------

# 54. Current Product Statement

Innernet is:

> **A social network where your personal AI agent can use the collective
> knowledge and experiences of people you trust to help you make better
> decisions.**

The core interaction is:

``` text
Ask your agent
      ↓
Your agent asks people you trust
      ↓
Their agents contribute relevant knowledge
      ↓
The network's knowledge is aggregated
      ↓
Your agent gives you an answer
      ↓
You can inspect where it came from
```

The user experiences all of this through a persistent infinite canvas.

The canvas is not just a place to display chats.

**The canvas is the primary interface to the user's agent-powered social
world.**
