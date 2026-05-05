<?php

namespace Tests\Feature\Proposal;

use App\Models\Proposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DestroyProposalTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return void
     */
    public function test_professor_can_delete_own_proposal(): void
    {
        $professor = User::factory()->create(['role' => 'professor']);
        $token = $professor->createToken('api')->plainTextToken;
        $proposal = Proposal::factory()->create(['professor_id' => $professor->id]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/proposals/{$proposal->id}")
            ->assertStatus(204);

        $this->assertDatabaseMissing('proposals', ['id' => $proposal->id]);
    }

    /**
     * @return void
     */
    public function test_professor_cannot_delete_another_professors_proposal(): void
    {
        $professor = User::factory()->create(['role' => 'professor']);
        $other = User::factory()->create(['role' => 'professor']);
        $token = $other->createToken('api')->plainTextToken;
        $proposal = Proposal::factory()->create(['professor_id' => $professor->id]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/proposals/{$proposal->id}")
            ->assertStatus(403);

        $this->assertDatabaseHas('proposals', ['id' => $proposal->id]);
    }

    /**
     * @return void
     */
    public function test_unauthenticated_user_cannot_delete_proposal(): void
    {
        $proposal = Proposal::factory()->create();

        $this->deleteJson("/api/proposals/{$proposal->id}")->assertStatus(401);
    }
}
