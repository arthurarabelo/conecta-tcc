<?php

namespace Tests\Feature\Application;

use App\Models\Application;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApplyTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return void
     */
    public function test_student_can_apply_to_open_proposal(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $proposal = Proposal::factory()->create(['status' => 'open', 'max_slots' => 2]);
        $token = $student->createToken('api')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/proposals/{$proposal->id}/apply");

        $response->assertStatus(201)
            ->assertJsonStructure(['id', 'status', 'student', 'proposal'])
            ->assertJsonFragment(['status' => 'pending']);

        $this->assertDatabaseHas('applications', [
            'student_id' => $student->id,
            'proposal_id' => $proposal->id,
        ]);
    }

    /**
     * @return void
     */
    public function test_professor_cannot_apply(): void
    {
        $professor = User::factory()->create(['role' => 'professor']);
        $proposal = Proposal::factory()->create();
        $token = $professor->createToken('api')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/proposals/{$proposal->id}/apply")
            ->assertStatus(403);
    }

    /**
     * @return void
     */
    public function test_student_cannot_apply_to_closed_proposal(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $proposal = Proposal::factory()->create(['status' => 'closed']);
        $token = $student->createToken('api')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/proposals/{$proposal->id}/apply")
            ->assertStatus(422)
            ->assertJsonFragment(['message' => 'Esta proposta está fechada.']);
    }

    /**
     * @return void
     */
    public function test_student_cannot_apply_when_no_slots_available(): void
    {
        $professor = User::factory()->create(['role' => 'professor']);
        $proposal = Proposal::factory()->create(['professor_id' => $professor->id, 'max_slots' => 1]);

        $existingStudent = User::factory()->create(['role' => 'student']);
        Application::factory()->create([
            'student_id' => $existingStudent->id,
            'proposal_id' => $proposal->id,
            'status' => 'approved',
        ]);

        $student = User::factory()->create(['role' => 'student']);
        $token = $student->createToken('api')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/proposals/{$proposal->id}/apply")
            ->assertStatus(422)
            ->assertJsonFragment(['message' => 'Não há vagas disponíveis.']);
    }

    /**
     * @return void
     */
    public function test_student_cannot_apply_twice_to_same_proposal(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $proposal = Proposal::factory()->create(['max_slots' => 5]);
        $token = $student->createToken('api')->plainTextToken;

        Application::factory()->create([
            'student_id' => $student->id,
            'proposal_id' => $proposal->id,
        ]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/proposals/{$proposal->id}/apply")
            ->assertStatus(422)
            ->assertJsonFragment(['message' => 'Você já se candidatou a esta proposta.']);
    }

    /**
     * @return void
     */
    public function test_unauthenticated_user_cannot_apply(): void
    {
        $proposal = Proposal::factory()->create();

        $this->postJson("/api/proposals/{$proposal->id}/apply")->assertStatus(401);
    }
}
