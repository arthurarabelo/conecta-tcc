<?php

namespace Tests\Feature\Proposal;

use App\Models\Proposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UpdateProposalTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return void
     */
    public function test_professor_can_update_own_proposal(): void
    {
        $professor = User::factory()->create(['role' => 'professor']);
        $token = $professor->createToken('api')->plainTextToken;
        $proposal = Proposal::factory()->create(['professor_id' => $professor->id]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/proposals/{$proposal->id}", [
                'title' => 'Título Atualizado',
                'status' => 'closed',
            ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['title' => 'Título Atualizado', 'status' => 'closed']);

        $this->assertDatabaseHas('proposals', [
            'id' => $proposal->id,
            'title' => 'Título Atualizado',
            'status' => 'closed',
        ]);
    }

    /**
     * @return void
     */
    public function test_professor_cannot_update_another_professors_proposal(): void
    {
        $professor = User::factory()->create(['role' => 'professor']);
        $other = User::factory()->create(['role' => 'professor']);
        $token = $other->createToken('api')->plainTextToken;
        $proposal = Proposal::factory()->create(['professor_id' => $professor->id]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/proposals/{$proposal->id}", ['title' => 'Invasão'])
            ->assertStatus(403);
    }

    /**
     * @return void
     */
    public function test_update_fails_with_invalid_status(): void
    {
        $professor = User::factory()->create(['role' => 'professor']);
        $token = $professor->createToken('api')->plainTextToken;
        $proposal = Proposal::factory()->create(['professor_id' => $professor->id]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/proposals/{$proposal->id}", ['status' => 'invalid'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    }

    /**
     * @return void
     */
    public function test_unauthenticated_user_cannot_update_proposal(): void
    {
        $proposal = Proposal::factory()->create();

        $this->putJson("/api/proposals/{$proposal->id}", ['title' => 'Hack'])
            ->assertStatus(401);
    }
}
