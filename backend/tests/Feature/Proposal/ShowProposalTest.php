<?php

namespace Tests\Feature\Proposal;

use App\Models\Proposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShowProposalTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return void
     */
    public function test_authenticated_user_can_view_proposal(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('api')->plainTextToken;
        $proposal = Proposal::factory()->create();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/proposals/{$proposal->id}")
            ->assertStatus(200)
            ->assertJsonFragment(['id' => $proposal->id, 'title' => $proposal->title]);
    }

    /**
     * @return void
     */
    public function test_unauthenticated_user_can_view_proposal(): void
    {
        $proposal = Proposal::factory()->create();

        $this->getJson("/api/proposals/{$proposal->id}")
            ->assertStatus(200)
            ->assertJsonFragment(['id' => $proposal->id]);
    }

    /**
     * @return void
     */
    public function test_returns_404_for_nonexistent_proposal(): void
    {
        $this->getJson('/api/proposals/999')->assertStatus(404);
    }
}
