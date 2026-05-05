<?php

namespace Tests\Feature\Proposal;

use App\Models\Proposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IndexProposalTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return void
     */
    public function test_authenticated_user_can_list_proposals(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('api')->plainTextToken;

        Proposal::factory()->count(3)->create();

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/proposals');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [['id', 'title', 'description', 'max_slots', 'status', 'professor']],
                'total',
            ]);

        $this->assertCount(3, $response->json('data'));
    }

    /**
     * @return void
     */
    public function test_proposals_can_be_filtered_by_status(): void
    {
        $professor = User::factory()->create(['role' => 'professor']);
        $token = $professor->createToken('api')->plainTextToken;

        Proposal::factory()->count(2)->create(['professor_id' => $professor->id, 'status' => 'open']);
        Proposal::factory()->create(['professor_id' => $professor->id, 'status' => 'closed']);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/proposals?status=open');

        $response->assertStatus(200);
        $this->assertCount(2, $response->json('data'));
    }

    /**
     * @return void
     */
    public function test_unauthenticated_user_cannot_list_proposals(): void
    {
        $this->getJson('/api/proposals')->assertStatus(401);
    }
}
